describe("Path", function() {

    it("should be equal to other state if entire path is equal", function() {
        var mainDef,
            mainContactDef,
            mainContactAddressDef,
            fromState,
            toState;


        mainDef = Ext.create('StateRouter.staterouter.StateDefinition', {
            name: 'main'
        });

        mainContactDef = Ext.create('StateRouter.staterouter.StateDefinition', {
            name: 'main.contact',
            params: ['id']
        });

        mainContactAddressDef = Ext.create('StateRouter.staterouter.StateDefinition', {
            name: 'main.contact.address',
            params: ['addressId']
        });

        function createNode(ownParams, state) {
            var node = Ext.create('StateRouter.staterouter.PathNode');
            node.ownParams = ownParams;
            node.state = state;
            return node;
        }

        fromState = Ext.create('StateRouter.staterouter.Path');
        fromState.nodes = [
            createNode(null, mainDef),
            createNode({
                id: 1
            }, mainContactDef),
            createNode({
                addressId: 10
            }, mainContactAddressDef)
        ];

        toState = Ext.create('StateRouter.staterouter.Path');
        toState.nodes = [
            createNode(null, mainDef),
            createNode({
                id: 1
            }, mainContactDef),
            createNode({
                addressId: 10
            }, mainContactAddressDef)
        ];

        expect(fromState.isEqual(toState)).toBe(true);
    });

    describe("View Tests", function () {

        var vp;

        beforeEach(function () {
            vp = Ext.create('Ext.container.Container', {
                id: 'vp',
                renderTo: Ext.getBody()
            });
        });

        afterEach(function () {
            vp.destroy();
        });

        it("child state cannot be inserted into any path state view", function () {

            var path = Ext.create('StateRouter.staterouter.Path', {
                nodes: [
                    Ext.create('StateRouter.staterouter.PathNode'),
                    Ext.create('StateRouter.staterouter.PathNode')
                ]
            });

            var containerToInsertChild = path.findContainerToInsertChild(1);

            expect(containerToInsertChild).toBeNull();
        });

        it("child state view should be inserted directly into parent state view", function () {

            Ext.define('A', {
                extend: 'Ext.container.Container',
                id: 'a',
                routerView: true
            });

            var path = Ext.create('StateRouter.staterouter.Path', {
                nodes: [
                    Ext.create('StateRouter.staterouter.PathNode'),
                    Ext.create('StateRouter.staterouter.PathNode')
                ]
            });

            var a = Ext.create('A');
            Ext.getCmp('vp').add(a);
            path.nodes[0].registerView(a);

            var containerToInsertChild = path.findContainerToInsertChild(1);

            expect(containerToInsertChild).not.toBeUndefined();
            expect(containerToInsertChild).not.toBeNull();
            expect(containerToInsertChild.getId()).toBe('a');
        });

        it("child state view should be inserted into parents state's  child item", function () {

            Ext.define('A', {
                extend: 'Ext.container.Container',
                id: 'a',
                items: [{
                    xtype: 'container',
                    id: 'a1',
                    items: [{
                        xtype: 'container',
                        id: 'a2',
                        routerView: true
                    }]
                }]
            });

            var path = Ext.create('StateRouter.staterouter.Path', {
                nodes: [
                    Ext.create('StateRouter.staterouter.PathNode'),
                    Ext.create('StateRouter.staterouter.PathNode')
                ]
            });

            var a = Ext.create('A');
            Ext.getCmp('vp').add(a);
            path.nodes[0].registerView(a);

            var containerToInsertChild = path.findContainerToInsertChild(1);

            expect(containerToInsertChild).not.toBeUndefined();
            expect(containerToInsertChild).not.toBeNull();
            expect(containerToInsertChild.getId()).toBe('a2');
        });

        it("child state view should skip a parent state and be inserted further up the state tree", function () {

            Ext.define('A', {
                extend: 'Ext.container.Container',
                id: 'a',
                items: [{
                    xtype: 'container',
                    id: 'a1',
                    items: [{
                        xtype: 'container',
                        id: 'a2',
                        routerView: true
                    }]
                }]
            });

            var path = Ext.create('StateRouter.staterouter.Path', {
                nodes: [
                    Ext.create('StateRouter.staterouter.PathNode'),
                    Ext.create('StateRouter.staterouter.PathNode'),
                    Ext.create('StateRouter.staterouter.PathNode')
                ]
            });

            var a = Ext.create('A');
            Ext.getCmp('vp').add(a);
            path.nodes[0].registerView(a);

            var containerToInsertChild = path.findContainerToInsertChild(2);

            expect(containerToInsertChild).not.toBeUndefined();
            expect(containerToInsertChild).not.toBeNull();
            expect(containerToInsertChild.getId()).toBe('a2');
        });
    });
});