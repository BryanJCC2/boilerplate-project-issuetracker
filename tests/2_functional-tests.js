const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Create an issue with every field', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'Functional Test',
        assigned_to: 'Chai',
        status_text: 'In QA'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'Text');
        assert.equal(res.body.created_by, 'Functional Test');
        assert.equal(res.body.assigned_to, 'Chai');
        assert.equal(res.body.status_text, 'In QA');
        assert.isBoolean(res.body.open);
        assert.isString(res.body._id);
        assert.isString(res.body.created_on);
        assert.isString(res.body.updated_on);
        done();
      });
  });

  test('Create an issue with only required fields', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title 2',
        issue_text: 'Text 2',
        created_by: 'Functional Test 2'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title 2');
        assert.equal(res.body.issue_text, 'Text 2');
        assert.equal(res.body.created_by, 'Functional Test 2');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isBoolean(res.body.open);
        assert.isString(res.body._id);
        assert.isString(res.body.created_on);
        assert.isString(res.body.updated_on);
        done();
      });
  });

  test('Create an issue with missing required fields', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title Only'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project', function(done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 2);   // ya creamos 2 issues
        res.body.forEach(issue => {
          assert.property(issue, 'issue_title');
          assert.property(issue, 'issue_text');
          assert.property(issue, 'created_by');
          assert.property(issue, 'assigned_to');
          assert.property(issue, 'status_text');
          assert.property(issue, 'open');
          assert.property(issue, '_id');
          assert.property(issue, 'created_on');
          assert.property(issue, 'updated_on');
        });
        done();
      });
  });

  test('View issues with one filter', function(done) {
    chai
      .request(server)
      .get('/api/issues/test?open=false')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => assert.equal(issue.open, false));
        done();
      });
  });

  test('View issues with multiple filters', function(done) {
    chai
      .request(server)
      .get('/api/issues/test?open=true&assigned_to=Chai')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.open, true);
          assert.equal(issue.assigned_to, 'Chai');
        });
        done();
      });
  });

  test('Update one field on an issue', function(done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        const _id = res.body[0]._id;
        chai
          .request(server)
          .put('/api/issues/test')
          .send({ _id, issue_title: 'New Title' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, _id);
            done();
          });
      });
  });

  test('Update an issue with missing _id', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({ issue_title: 'No ID' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with an invalid _id', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({ _id: '123invalid', issue_title: 'X' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', function(done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        const _id = res.body[0]._id;
        chai
          .request(server)
          .delete('/api/issues/test')
          .send({ _id })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, _id);
            done();
          });
      });
  });

  test('Delete an issue with invalid _id', function(done) {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({ _id: '123invalid' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id', function(done) {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Create and delete an issue', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'To Delete',
        issue_text: 'Will be removed',
        created_by: 'Test'
      })
      .end(function(err, res) {
        const _id = res.body._id;
        chai
          .request(server)
          .delete('/api/issues/test')
          .send({ _id })
          .end(function(err, res) {
            assert.equal(res.body.result, 'successfully deleted');
            done();
          });
      });
  });

  test('Update multiple fields', function(done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        const _id = res.body[0]._id;
        chai
          .request(server)
          .put('/api/issues/test')
          .send({
            _id,
            issue_title: 'New Title',
            status_text: 'New Status'
          })
          .end(function(err, res) {
            assert.equal(res.body.result, 'successfully updated');
            done();
          });
      });
  });

});