'use strict';

const Issue = require('../models/issue');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      const filter = { project, ...req.query };   // req.query trae los filtros
      const issues = await Issue.find(filter);
      res.json(issues);
    })

    .post(async function (req, res){
      let project = req.params.project;

      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const newIssue = await new Issue({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          project
        }).save();

        res.json(newIssue);
      } catch (err) {
        res.json({ error: 'could not save' });
      }
    })

    .put(async function (req, res) {
      let project = req.params.project;
      const { _id, ...fields } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });
      if (Object.keys(fields).length === 0) return res.json({ error: 'no update field(s) sent', _id });
      
      fields.updated_on = new Date();
      try {
        const updated = await Issue.findByIdAndUpdate(_id, fields, { new: true });
        if (!updated) return res.json({ error: 'could not update', _id });
        res.json({ result: 'successfully updated', _id });
      } catch (e) {
        res.json({ error: 'could not update', _id });
      }
    })
    
    .delete(async function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deleted = await Issue.findByIdAndDelete(_id);
        if (!deleted) return res.json({ error: 'could not delete', _id });
        res.json({ result: 'successfully deleted', _id });
      } catch (e) {
        res.json({ error: 'could not delete', _id });
      }
    })
    
};
