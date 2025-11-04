const Incident = require('../models/Incident');

async function createIncident(req, res, next) {
  try {
    const data = req.body;
    data.createdBy = req.userId;
    if (!data.incidentId) {
      const now = new Date(data.dateTime || Date.now());
      const stamp = now.toISOString().slice(0,10).replace(/-/g,'');
      data.incidentId = `INC-${stamp}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    }
    const incident = await Incident.create(data);
    res.status(201).json(incident);
  } catch (err) {
    next(err);
  }
}

async function listIncidents(req, res, next) {
  try {
    const {
      documentId,
      eventType,
      eventClassification,
      location,
      shift,
      sort = 'dateTime',
      dir = 'desc',
      limit = '200',
      page = '1',
    } = req.query;

    const match = {};
    if (eventType) match.eventType = String(eventType);
    if (eventClassification) match.eventClassification = String(eventClassification);
    if (location) match.location = String(location);
    if (shift) match.shift = String(shift);

    if (documentId) {
      const Employee = require('../models/Employee');
      const emp = await Employee.findOne({ documentId: String(documentId), active: true }, { _id: 1 });
      if (!emp) return res.json([]);
      // @ts-ignore
      match.employee = emp._id;
    }

    const sortDir = String(dir).toLowerCase() === 'asc' ? 1 : -1;
    const numericLimit = Math.min(parseInt(String(limit)) || 200, 1000);
    const numericPage = Math.max(parseInt(String(page)) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const items = await Incident.find(match)
      .populate('employee', 'fullName documentId')
      .sort({ [String(sort)]: sortDir })
      .skip(skip)
      .limit(numericLimit);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    const [
      total,
      byType,
      byClassification,
      byBodyPart,
      byLocation,
      last30Days,
    ] = await Promise.all([
      Incident.countDocuments(),
      Incident.aggregate([{ $group: { _id: '$eventType', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Incident.aggregate([{ $group: { _id: '$eventClassification', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Incident.aggregate([{ $group: { _id: '$bodyPartAffected', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Incident.aggregate([{ $group: { _id: '$location', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Incident.aggregate([
        { $match: { dateTime: { $gte: new Date(Date.now() - 1000*60*60*24*30) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateTime' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ total, byType, byClassification, byBodyPart, byLocation, last30Days });
  } catch (err) {
    next(err);
  }
}

module.exports = { createIncident, listIncidents, stats };



