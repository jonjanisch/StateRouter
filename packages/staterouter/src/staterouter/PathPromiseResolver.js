Ext.define('StateRouter.staterouter.PathPromiseResolver', {

    chainPromise: function (previousPathNode, pathNode, existingPromise) {
        return existingPromise.then(function () {
            var promises = [];
            var stateName = pathNode.state.name;
            var controller = pathNode.controller;
            var resolved = {};
            var previouslyResolved = {};

            if (previousPathNode) {
                previouslyResolved = previousPathNode.allResolved;
            }
            var allResolved = Ext.apply({}, previouslyResolved);
            allResolved[stateName] = resolved;

            // Store the results in both the PathNode and the Controller
            // Also, set the controller's stateName here as a convenience
            pathNode.resolved = resolved;
            pathNode.allResolved = allResolved;

            if (pathNode.state && pathNode.state.resolve) {
                // Create a new promise for each resolvable and add it to the promises array
                Ext.Object.each(pathNode.state.resolve, function (key, resolveFn) {
                    if (Ext.isFunction(resolveFn)) {

                        var promise = new RSVP.Promise(function (resolve, reject) {
                            // Wrap the success in another callback so we can store the result in the controller
                            var successCallback = function (results) {
                                resolved[key] = results;
                                resolve(results);
                            };

                            Ext.callback(resolveFn, pathNode, [successCallback, reject, pathNode.allParams, previouslyResolved]);
                        });
                        promises.push(promise);
                    }
                });
            }

            if (controller) {
                controller.stateName = stateName;
                controller.resolved = resolved;
                controller.allResolved = allResolved;

                // Create a new promise for each resolvable and add it to the promises array
                Ext.Object.each(controller.resolve, function (key, resolveFn) {
                    if (Ext.isFunction(resolveFn)) {

                        var promise = new RSVP.Promise(function (resolve, reject) {
                            // Wrap the success in another callback so we can store the result in the controller
                            var successCallback = function (results) {
                                resolved[key] = results;
                                resolve(results);
                            };

                            Ext.callback(resolveFn, controller, [successCallback, reject, pathNode.allParams, previouslyResolved]);
                        });
                        promises.push(promise);
                    }
                });
            }

            return RSVP.all(promises);
        });
    },

    createResolvePromise: function (toPath, keep) {
        var previousPathNode;
        var p;
        var i = keep;
        var pathNode;

        p = new RSVP.Promise(function (resolve) { resolve(); });

        while (i < toPath.length) {
            pathNode = toPath[i];
            previousPathNode = null;

            if (i > 0) {
                previousPathNode = toPath[i - 1];
            }

            p = this.chainPromise(previousPathNode, pathNode, p);
            i++;
        }

        return p;
    }
});