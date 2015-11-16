Picker.route('/jobs/:id/download', function(params, req, res, next) {
  var job = Jobs.findOne(params.id);

  if (job) {
    var csv = Papa.unparse(job.result.data, { delimiter: ';' });

    res.writeHead(200, {
      'Content-Type': 'application/csv',
      'Content-Disposition': `attachment; filename="${job.name}.csv"`
    });
    res.end(csv);
  }
});