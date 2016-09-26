// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/shipments/entries',
    app.middleware.authenticate(),
    bodyParser.json(),
    function (req, res, next) {

      var authorData = {
        _id: req.tokenData.sub,
        name: req.tokenData.name,
      };

      var supplier    = req.body.supplier;
      var allocations = req.body.allocations || [];

      console.log(allocations);

      app.controllers.shipment
        .scheduleEntry(authorData, supplier, req.body, allocations)
        .then((shipment) => {
          res.json(shipment);
        })
        .catch(next);
    }
  );

  // app.post('/shipments/exits',
  //   app.middleware.authenticate(),
  //   bodyParser.json(),
  //   function (req, res, next) {

  //     var authorData = {
  //       _id: req.tokenData.sub,
  //       name: req.tokenData.name,
  //     };
      
  //   }
  // );

  app.get('/shipments',
    app.middleware.authenticate(),
    function (req, res, next) {

      app.controllers.shipment.list()
        .then((shipments) => {
          res.json(shipments);
        })
        .catch(next);
    }
  );

  app.get('/shipment/:shipmentId',
    app.middleware.authenticate(),
    function (req, res, next) {

      var _shipment;

      app.controllers.shipment.getById(req.params.shipmentId)
        .then((shipment) => {
          _shipment = shipment;

          return app.controllers.shipment.getSummary(shipment);
        })
        .then((shipmentSummary) => {
          var shipmentData     = _shipment.toJSON();
          shipmentData.summary = shipmentSummary;

          res.json(shipmentData);
        })
        .catch(next);

    }
  );

  app.post('/shipment/:shipmentId/operations/entries',
    app.middleware.authenticate(),
    app.middleware.loadShipment(),
    bodyParser.json(),
    function (req, res, next) {
      
      var shipment = req.shipment;

      app.controllers.operation.registerEntry(shipment, req.body)
        .then((operation) => {
          res.json(operation);
        })
        .catch(next);

    }
  );
};
