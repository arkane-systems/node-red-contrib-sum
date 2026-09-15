module.exports = function(RED) {
    "use strict";

    function sum(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        this.topic = config.topic;
        this.topics = {};

        function updateStatus(total) {
            node.status({fill: "blue", shape: "dot", text: "sum: " + total});
        }

        this.on("input", function(msg, send, done) {
            // For maximum backwards compatibility, check that send exists.
            // If this node is installed in Node-RED 0.x, it will need to
            // fallback to using `node.send`
            send = send || function() { node.send.apply(node, arguments); };

            if( msg.hasOwnProperty("payload") ) {
                var input = Number(msg.payload);

                // handle reset
                if( msg.hasOwnProperty("reset") && msg.reset ) {
                    node.topics = {};

                    msg.payload = 0;
                    send(msg);
                    updateStatus(0);
                }

                // handle input
                else if( !isNaN(input) && isFinite(input) ) {
                    var topic = msg.hasOwnProperty("topic") && msg.topic !== undefined && msg.topic !== null
                        ? msg.topic.toString()
                        : "";

                    node.topics[topic] = input;

                    var total = Object.keys(node.topics).reduce(function(a, b) {
                        return a + node.topics[b];
                    }, 0);

                    msg.payload = total;

                    // overwrite topic if configured
                    if( node.topic ) {
                        msg.topic = node.topic;
                    }

                    send(msg);
                    updateStatus(total);
                }

                // everything else
                else {
                    node.warn("Not a number: " + msg.payload);
                }
            }

            if( done ) {
                done();
            }
        });

        this.on("close", function() {
            node.status({});
        });
    }

    RED.nodes.registerType("sum", sum);
};
