/**
 * Created by User on 7/19/2017.
 */

(function () {
    'use strict';

    var selectedUrl = null;
    var interval = null;

    var options = {
        "elementId": "sunburstChart"
    };

    var healthArr = [
        'ACTIVE',
        'PASSIVE',
        'INACTIVE'
    ];

    var sizeArr = [100, 250, 500, 1000];

    var sunburst = new Sunburst(options);

    var dataOptObj = {
        "data1": 'data/json01',
        "data2": 'data/json02'
    };

    function fnGetParentID(index) {
        var indexArr = index.split(' > ');
        var parentIndex = '';
        if (indexArr.length !== 1) {
            parentIndex = index.replace(" > " + indexArr[indexArr.length - 1], '')
        }
        return parentIndex;
    }

    function fnCreateStructure(f) {
        return f.sort(function (a, b) {
            return a.index.length < b.index.length ? 1 : a.index.length === b.index.length ? a.index < b.index ? -1 : 1 : -1;
        }).reduce(function (p, c, i, a) {
            c.ParentID = fnGetParentID(c.index);
            var parent = !!c.ParentID && a.find(function (e) {
                    return e.index === c.ParentID;
                });
            !!parent ? !!parent.children && parent.children.push(c) || (parent.children = [c]) : p.push(c);
            return p;
        }, []);
    }

    function fnCreateNested(data) {
        // var root = {
        //     "id": 'A1',
        //     "name": 'tree',
        //     "index": 'tree',
        //     "health": 'ACTIVE',
        //     "type": 'tree',
        //     "size": 100
        // };
        var arr1 = [];
        data.forEach(function (obj, index) {
            // obj.index = root.name + ' > ' + obj.index;
            obj.index = obj.index;
            obj.size = sizeArr[Math.floor(Math.random() * sizeArr.length)];
            obj.name = obj.index;
            obj.type = 'node';

            // var obj = {
            //     name: obj.description.name,
            //     index: obj.index,
            //     health: obj.health,
            //     id: index
            // };
            //
            // arr1.push(obj);


            if (interval) { // set dummy random health when interval call
                obj.health = healthArr[Math.floor(Math.random() * healthArr.length)];
            }


        });

        // console.log(JSON.stringify(arr1));

        // data.unshift(root); // added tree object at first
        return fnCreateStructure(data);
    }

    function fnGetData(url) {
        selectedUrl = url;
        $.getJSON(selectedUrl, function (data) {
            var root = {
                'name': 'root',
                'status': 'WHITE',
                'children': fnCreateNested(data)
            };
            sunburst.update(root);
            // console.log('nestedJson', nestedJson)
        });
    }

    function fnInterval() {
        var randomKey = Object.keys(dataOptObj)[Math.floor(Math.random() * Object.keys(dataOptObj).length)];
        var url = dataOptObj[randomKey];
        fnGetData(url);
        interval = setTimeout(function () {
            fnInterval();
        }, 2000);
    }

    $('#dataBtnGroup a').click(function () {
        if (interval) {
            clearTimeout(interval);
            interval = null;
        }
        var url = null;
        var type = $(this).attr('name');
        switch (type) {
            case 'interval':
                fnInterval();
                break;
            default:
                url = dataOptObj[type];
                fnGetData(url)
        }
    });

    fnGetData(dataOptObj['data1']);
})();