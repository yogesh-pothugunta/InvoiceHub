const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// @route  GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Overdue auto-update
    await Invoice.updateMany(
      { user: userId, status: 'sent', dueDate: { $lt: now } },
      { status: 'overdue' }
    );

    const [allInvoices, statusCounts, monthlyRevenue, lastMonthRevenue, topClients] = await Promise.all([
      Invoice.find({ user: userId }),
      Invoice.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { user: userId, status: 'paid', paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Invoice.aggregate([
        { $match: { user: userId, status: 'paid', paidAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$clientSnapshot.name', total: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ])
    ]);

    const statusMap = {};
    statusCounts.forEach(s => { statusMap[s._id] = { count: s.count, total: s.total }; });

    const totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const pendingAmount = allInvoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.total, 0);

    // Monthly chart - last 6 months
    const monthlyChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      const monthInvoices = allInvoices.filter(inv => {
        const created = new Date(inv.createdAt);
        return created >= d && created <= end;
      });
      monthlyChart.push({
        month: label,
        total: parseFloat(monthInvoices.reduce((s, inv) => s + inv.total, 0).toFixed(2)),
        paid: parseFloat(monthInvoices.filter(inv => inv.status === 'paid').reduce((s, inv) => s + inv.total, 0).toFixed(2)),
        count: monthInvoices.length
      });
    }

    res.json({
      success: true,
      data: {
        totalInvoices: allInvoices.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        pendingAmount: parseFloat(pendingAmount.toFixed(2)),
        thisMonthRevenue: parseFloat((monthlyRevenue[0]?.total || 0).toFixed(2)),
        lastMonthRevenue: parseFloat((lastMonthRevenue[0]?.total || 0).toFixed(2)),
        statusBreakdown: {
          paid: statusMap['paid'] || { count: 0, total: 0 },
          sent: statusMap['sent'] || { count: 0, total: 0 },
          draft: statusMap['draft'] || { count: 0, total: 0 },
          overdue: statusMap['overdue'] || { count: 0, total: 0 },
          cancelled: statusMap['cancelled'] || { count: 0, total: 0 }
        },
        monthlyChart,
        topClients
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/dashboard/recent
const getRecent = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    const overdue = await Invoice.find({ user: req.user.id, status: 'overdue' })
      .sort({ dueDate: 1 })
      .limit(5);

    res.json({ success: true, data: { recent: invoices, overdue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getRecent };
