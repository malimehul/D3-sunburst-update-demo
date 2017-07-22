/**
 * Created by User on 7/20/2017.
 */
(function () {

    var sunburst, self;

    var margin = {
        "top": 50,
        "right": 50,
        "bottom": 50,
        "left": 50
    };

    function fnRatio(width) {
        console.log('width', width)
        if (800 < width && width < 1024) {
            return 0.3;
        } else if (768 < width && width < 800) {
            return 0.3;
        } else if (640 < width && width < 768) {
            return 0.3;
        } else if (320 < width && width < 640) {
            return 0.4;
        } else if (width < 320) {
            return 0.7;
        }
        return 0.4;
    }

    /*
     * create class(Sunburst) constructor
     * */
    sunburst = window.Sunburst = function (options) {
        self = this;

        // set options for chart
        self.strElementId = options && options.elementId ? '#' + options.elementId : 'body';
        self.marginObj = options && options.margin ? '#' + options.margin : margin;
        self.eleParent = $(self.strElementId).parent();
        // self.color = d3.scale.category10();
        self.colors = {
            WHITE: "rgba(0,0,0,0)",
            ACTIVE: "#CC0000",
            PASSIVE: "#0066FF",
            INACTIVE: "#8c8c8c",
            UNKNOWN: 'url(#hash4_4)'
        };

        // x axis setup
        self.xLinerScale = d3.scale.linear();

        // y axis setup
        self.yLinerScale = d3.scale.linear();

        //  init SVG element
        self.svg = d3.select(self.strElementId).append('svg');

        self.pattern = self.svg.append("defs")
            .append("pattern")
            .attr({
                id: "hash4_4",
                width: "6",
                height: "6",
                patternUnits: "userSpaceOnUse",
                patternTransform: "rotate(45 50 50)"
            });
        self.pattern.append("line")
            .attr({'stroke-width': "12px", 'stroke': "#ff0000", 'y2': "10"});

        self.pattern.append("line")
            .attr({'stroke-width': "6px", 'stroke': "#000000", 'y2': "20"});

        self.scatterWrapper = self.svg.append('g');

        self.partition = d3.layout.partition()
            .value(function (d) {
                return d.size;
            });

        self.arc = d3.svg.arc();
    };

    sunburst.prototype.render = function () {
        var width = self.eleParent.width();
        var height = fnRatio(width) * width;

        self.chartWidth = width - (self.marginObj.right + self.marginObj.left);
        self.chartHeight = height - (self.marginObj.top + self.marginObj.bottom);

        self.radius = Math.min(self.chartWidth, self.chartHeight) / 2;

        self.xLinerScale.range([0, 2 * Math.PI]);
        self.yLinerScale.range([0, self.radius]);

        self.arc
            .startAngle(function (d) {
                return Math.max(0, Math.min(2 * Math.PI, self.xLinerScale(d.x)));
            })
            .endAngle(function (d) {
                return Math.max(0, Math.min(2 * Math.PI, self.xLinerScale(d.x + d.dx)));
            })
            .innerRadius(function (d) {
                return Math.max(0, self.yLinerScale(d.y));
            })
            .outerRadius(function (d) {
                return Math.max(0, self.yLinerScale(d.y + d.dy));
            });

        //update svg elements to new dimensions
        self.svg.attr('width', self.chartWidth + self.marginObj.right + self.marginObj.left)
            .attr('height', self.chartHeight + self.marginObj.top + self.marginObj.bottom);

        self.scatterWrapper.attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

        self.pathWarapper.attr("d", self.arc);
    };

    /*
     * create init chart with init data and update chart with new data
     * */
    sunburst.prototype.update = function (root) {

        // DATA JOIN - Join new data with old elements, if any.
        self.pathWarapper = self.scatterWrapper.selectAll("path")
            .data(self.partition.nodes(root));

        // enter and update
        self.path = self.pathWarapper.enter().append("path")
            .style("stroke", "white");

        self.path.append("title");

        self.pathWarapper
            .style("fill", function (d) {
                // return self.color((d.children ? d : d.parent).name);
                return self.colors[d.health ? d.health : d.status ? d.status : 'GRAY'];
            });

        self.pathWarapper.select('title')
            .text(function (d) {
                return d.name !== 'root' ? d.health + "\n" + d.name : '';
            });

        // remove old extra path
        self.pathWarapper.exit().remove();

        self.render();
    };


})();