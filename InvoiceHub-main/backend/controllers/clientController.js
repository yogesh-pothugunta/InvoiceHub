const Client = require('../models/Client');
const Invoice = require('../models/Invoice');

const getClients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { user: req.user.id, isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, data: clients, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    const invoices = await Invoice.find({ user: req.user.id, client: req.params.id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: { client, invoices } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    const existing = await Client.findOne({ user: req.user.id, email: req.body.email });
    if (existing) return res.status(400).json({ success: false, message: 'Client with this email already exists' });
    const client = await Client.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, message: 'Client created', data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Client updated', data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const invoiceCount = await Invoice.countDocuments({ user: req.user.id, client: req.params.id });
    if (invoiceCount > 0) {
      await Client.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isActive: false });
      return res.json({ success: true, message: 'Client archived (has existing invoices)' });
    }
    await Client.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient };
