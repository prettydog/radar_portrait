/**
 * @author Gao.zhenzhen
 * @date 2020-02-28
 * @type {{draw: RadarChart.draw}}
 */
let Chart = {
    radar: function (options) {
        let cfg = {
            id: '',
            data: null,
            circleData: null,
            radius: 5,//拐点半径
            w: 300,
            h: 300,
            factor: 1,
            factorLegend: .85,
            levels: 6,
            showLevels: 6,//圆覆盖层数
            maxValue: 0,
            radians: 2 * Math.PI,
            opacityArea: 0.2,
            ToRight: 5,
            TranslateX: 80,
            TranslateY: 80,
            margin: {top: 100, right: 100, bottom: 100, left: 100},
            topAngle: 30
        };

        if ('undefined' !== typeof options) {
            for (let i in options) {
                if ('undefined' !== typeof options[i]) {
                    cfg[i] = options[i];
                }
            }
        }
        cfg.maxValue = Math.max(cfg.maxValue, d3.max(cfg.data, function (i) {
            return d3.max(i.map(function (o) {
                return o.value;
            }))
        }));
        let allAxis = (cfg.data[0].map(function (i, j) {
            return i.axis
        }));
        let total = allAxis.length;
        let radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
        let Format = d3.format('');
        d3.select(cfg.id).select("svg").remove();

        let g = d3.select(cfg.id)
            .append("svg")
            .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

        let tooltip;

        let circle_r = 0;
        //背景
        for (let j = 0; j < cfg.levels; j++) {
            let levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            //如果圆内数据为空则展示所有
            if (j >= (cfg.levels - (cfg.circleData.length > 0 ? cfg.showLevels : cfg.levels))) {
                g.selectAll(".levels")
                    .data(allAxis)
                    .enter()
                    .append("svg:line")
                    .attr("x1", function (d, i) {
                        return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
                    })
                    .attr("y1", function (d, i) {
                        return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
                    })
                    .attr("x2", function (d, i) {
                        return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
                    })
                    .attr("y2", function (d, i) {
                        return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
                    })
                    .attr("class", "line")
                    .style("stroke", "#2F2F2F")
                    .style("stroke-opacity", "0.75")
                    .style("stroke-width", "1px")
                    .attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
            }
            //内部圆半径
            if (j === (cfg.levels - cfg.showLevels)) {
                circle_r = radius / cfg.levels * j
            }
        }
        //背景文字
        for (let j = 0; j < cfg.levels; j++) {
            let levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            g.selectAll(".levels")
                .data([1]) //dummy data
                .enter()
                .append("svg:text")
                .attr("x", function (d) {
                    return levelFactor * (1 - cfg.factor * Math.sin(0));
                })
                .attr("y", function (d) {
                    return levelFactor * (1 - cfg.factor * Math.cos(0));
                })
                .attr("class", "legend")
                .style("font-family", "sans-serif")
                .style("font-size", "10px")
                .attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")")
                .attr("fill", "#737373")
                .text(Format((j + 1) * cfg.maxValue / cfg.levels));
        }

        let series = 0;

        let axis = g.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");

        //连接线
        axis.append("line")
            .attr("x1", cfg.w / 2)
            .attr("y1", cfg.h / 2)
            .attr("x2", function (d, i) {
                return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
            })
            .attr("y2", function (d, i) {
                return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
            })
            .attr("class", "line")
            .style("stroke", "#2F2F2F")
            .style("stroke-width", "1px");
        //雷达图 文字描述
        axis.append("text")
            .attr("class", "legend")
            .text(function (d) {
                return d
            })
            .style("font-family", "sans-serif")
            .style("font-size", "13px")
            .attr("text-anchor", "middle")
            .attr("dy", "1.5em")
            .attr('fill', '#FDE999')
            .attr("transform", function (d, i) {
                return "translate(0, -15)"
            })
            .attr("x", function (d, i) {
                return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total);
            })
            .attr("y", function (d, i) {
                return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total);
            });

        // 数据展示多边形
        cfg.data.forEach(function (y, x) {
            let dataValues = [];
            g.selectAll(".nodes")
                .data(y, function (j, i) {
                    dataValues.push([
                        cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
                        cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
                    ]);
                });
            dataValues.push(dataValues[0]);
            g.selectAll(".area")
                .data([dataValues])
                .enter()
                .append("polygon")
                .attr("class", "radar-chart-serie" + series)
                .style("stroke-width", "2px")
                .style("stroke", "#FDE999")
                .attr("points", function (d) {
                    let str = "";
                    for (let pti = 0; pti < d.length; pti++) {
                        str = str + d[pti][0] + "," + d[pti][1] + " ";
                    }
                    return str;
                })
                .style("fill", function (j, i) {
                    return "#FDE999"
                })
                .style("fill-opacity", cfg.opacityArea)
                .on('mouseover', function (d) {
                    let z = "polygon." + d3.select(this).attr("class");
                    g.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", 0.1);
                    g.selectAll(z)
                        .transition(200)
                        .style("fill-opacity", .7);
                })
                .on('mouseout', function () {
                    g.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", cfg.opacityArea);
                });
            series++;
        });
        series = 0;
        //数据拐点
        cfg.data.forEach(function (y, x) {
            g.selectAll(".nodes")
                .data(y).enter()
                .append("svg:circle")
                .attr("class", "radar-chart-serie" + series)
                .attr('r', cfg.radius)
                .attr("alt", function (j) {
                    return Math.max(j.value, 0)
                })
                .attr("cx", function (j, i) {
                    /*dataValues.push([
                        cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
                        cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
                    ]);*/
                    return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total));
                })
                .attr("cy", function (j, i) {
                    return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total));
                })
                .attr("data-id", function (j) {
                    return j.axis
                })
                .style("fill", "#FDE999").style("fill-opacity", .9)
                .on('mouseover', function (d) {
                    let newX = parseFloat(d3.select(this).attr('cx')) - 10;
                    let newY = parseFloat(d3.select(this).attr('cy')) - 5;
                    tooltip
                        .attr('x', newX)
                        .attr('y', newY)
                        .text(Format(d.value))
                        .transition(200)
                        .style('opacity', 1);

                    z = "polygon." + d3.select(this).attr("class");
                    g.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", 0.1);
                    g.selectAll(z)
                        .transition(200)
                        .style("fill-opacity", .7);
                })
                .on('mouseout', function () {
                    tooltip
                        .transition(200)
                        .style('opacity', 0);
                    g.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", cfg.opacityArea);
                })
                .append("svg:title")
                .text(function (j) {
                    return Math.max(j.value, 0)
                });

            series++;
        });
        //Tooltip
        tooltip = g.append('text')
            .style('opacity', 0)
            .style('font-family', 'sans-serif')
            .style('font-size', '13px');
        if (cfg.circleData && cfg.circleData.length > 0 && cfg.levels !== cfg.showLevels) {
            //底层遮盖圆
            g.append("circle")
                .attr("cx", cfg.w / 2)
                .attr("cy", cfg.h / 2)
                .attr("r", circle_r)
                .style("fill", "#232323")
                .style("stroke-width", "2px")
                .style("stroke", "#FDE999")
                .style("fill-opacity", 1);
            //透明遮盖圆
            g.append("circle")
                .attr("cx", cfg.w / 2)
                .attr("cy", cfg.h / 2)
                .attr("r", circle_r)
                .style("fill", "#232323")
                .style("stroke-width", "2px")
                .style("stroke", "#FDE999")
                .style("fill-opacity", 1);
            //透明虚线圆
            let dasharray = g.append("circle")
                .attr("id", "contentCircle")
                .attr("cx", cfg.w / 2)
                .attr("cy", cfg.h / 2)
                .attr("r", circle_r - 10)
                .style("fill", "#232323")
                .style("stroke-width", "1.5px")
                .style("stroke", "#FDE999")
                .style("stroke-dasharray", "7,7")
                .style("fill-opacity", 0.2);

            //计算左右显示属性个数
            let k = (cfg.circleData.length - 2) / 2;
            let leftNum = Math.round(k);
            let rightNum = cfg.circleData.length - 2 - leftNum;
            let offsetAngle = function (angle, d) {
                let px = 0;
                if (angle <= 90 || angle >= 270) {
                    return d.length * 10 / 2
                }
                return d.length * 10 / 2
            };
            // 添加圆内数据
            g.selectAll('svg').data(cfg.circleData).enter()
                .append('text')
                .attr("class", "legend")
                .text(function (d) {
                    return d;
                })
                .attr("text-anchor", function (d, i) {
                    if (i === 0 || i === leftNum + 1) {
                        return "middle";
                    }
                    return "start";
                })
                .attr('fill', '#FDE999')
                .style("font-size", "10px")
                .attr("transform", function (d, i) {
                    return "translate(0, 0)"
                })
                .attr("x", function (d, i) {
                    let x;
                    if (i === 0) {
                        x = cfg.w / 2;
                    } else if (i <= leftNum) {
                        //旋转270 - 15(顶部右边角度)-(i[当前item]-1[默认从0开始])*((180-2*cfg.topAngle[去掉上下两个偏移角度])/leftNum)平均每个数据所需的角度
                        let angle = (270 - cfg.topAngle - (i - 1) * (180 - 2 * cfg.topAngle) / leftNum - ((180 - 2 * cfg.topAngle) / leftNum) / 2);
                        x = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180) - offsetAngle(angle, d);
                    } else if (i === leftNum + 1) {
                        x = cfg.w / 2;
                    } else {
                        //270 旋转270 + 15(顶部右边角度)+(i[当前item]-leftNum[左边显示数量]-1[底部数据右边角度]-1[默认从0开始])
                        let angle = (270 + cfg.topAngle + (i - leftNum - 1 - 1) * (180 - 2 * cfg.topAngle) / leftNum + ((180 - 2 * cfg.topAngle) / leftNum) / 2);
                        if (angle > 360) {
                            angle = angle - 360;
                        }
                        x = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180) - offsetAngle(angle, d);
                    }
                    return x;
                })
                .attr("y", function (d, i) {
                    let y;
                    if (i === 0) {
                        y = cfg.h / 2 + (circle_r - 30) * Math.sin(270 * Math.PI / 180);
                    } else if (i <= leftNum) {
                        y = cfg.h / 2 + (circle_r - 30) * Math.sin((270 - cfg.topAngle - (i - 1) * (180 - 2 * cfg.topAngle) / leftNum - ((180 - 2 * cfg.topAngle) / leftNum) / 2) * Math.PI / 180);
                    } else if (i === leftNum + 1) {
                        y = cfg.h / 2 + (circle_r - 30) * Math.sin(90 * Math.PI / 180);
                    } else {
                        //270 旋转270 + 15(顶部右边角度)+(i[当前item]-leftNum[左边显示数量]-1[底部数据右边角度]-1[默认从0开始]) ((180 - 2 * cfg.topAngle) / leftNum)/2(平均角度的一半)
                        let angle = (270 + cfg.topAngle + (i - leftNum - 1 - 1) * (180 - 2 * cfg.topAngle) / leftNum + ((180 - 2 * cfg.topAngle) / leftNum) / 2);
                        if (cfg.circleData.length % 2 !== 0 && i === cfg.circleData.length - 1) {
                            angle = (270 + cfg.topAngle + ((i + 1) - leftNum - 1 - 1) * (180 - 2 * cfg.topAngle) / leftNum + ((180 - 2 * cfg.topAngle) / leftNum) / 2);
                        }
                        y = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180);
                    }
                    return y;
                });

            // 构造扩散连线
            let lineArr = [];
            for (let i = 0; i < cfg.circleData.length; i++) {
                let xy = {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0
                };
                let angle = (270 - cfg.topAngle - (i - 1) * (180 - 2 * cfg.topAngle) / leftNum - ((180 - 2 * cfg.topAngle) / leftNum) / 2);
                let angle2 = (270 + cfg.topAngle + ((i + leftNum + 1) - leftNum - 1 - 1) * (180 - 2 * cfg.topAngle) / leftNum + ((180 - 2 * cfg.topAngle) / leftNum) / 2);
                if (i === 0) {
                    // top 连线
                    xy.x1 = cfg.w / 2;
                    xy.y1 = cfg.h / 2 + (circle_r - 30) * Math.sin(270 * Math.PI / 180) + cfg.circleData[i].length * 3;
                    xy.x2 = cfg.w / 2;
                    xy.y2 = cfg.h / 2 - circle_r / 2;
                    // bottom 连线
                    lineArr.push({
                        x1: cfg.w / 2,
                        y1: cfg.h / 2 + (circle_r - 30) * Math.sin(90 * Math.PI / 180) - cfg.circleData[leftNum + 1].length * 3,
                        x2: cfg.w / 2,
                        y2: cfg.h / 2 + circle_r / 2
                    });
                    lineArr.push(xy);
                } else if (i === 1) {
                    // top-left 连线
                    xy.x1 = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180) + cfg.circleData[i].length * 6;
                    xy.y1 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5;
                    xy.x2 = cfg.w / 2 - circle_r / 2 / 2 - (cfg.w / 2 - circle_r / 2 / 2 - xy.x1) / 2;
                    xy.y2 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5;
                    lineArr.push({
                        x1: cfg.w / 2 - circle_r / 2 / 2 - (cfg.w / 2 - circle_r / 2 / 2 - xy.x1) / 2,
                        y1: cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5,
                        x2: cfg.w / 2 - circle_r / 2 / 2,
                        y2: cfg.h / 2 - circle_r / 2
                    });
                    // top-right 连线
                    let lineX1 = cfg.w / 2 + (circle_r - 30) * Math.cos(angle2 * Math.PI / 180) - cfg.circleData[(i + leftNum + 1)].length * 6;
                    lineArr.push({
                        x1: lineX1,
                        y1: cfg.h / 2 + (circle_r - 30) * Math.sin(angle2 * Math.PI / 180) - 5,
                        x2: cfg.w / 2 - circle_r / 2 / 2 + circle_r / 2 + (lineX1 - cfg.w / 2 - circle_r / 2 / 2) / 2,
                        y2: cfg.h / 2 + (circle_r - 30) * Math.sin(angle2 * Math.PI / 180) - 5
                    });
                    lineArr.push({
                        x1: lineX1 - (lineX1 - cfg.w / 2 - circle_r / 2 / 2) / 2,
                        y1: cfg.h / 2 + (circle_r - 30) * Math.sin(angle2 * Math.PI / 180) - 5,
                        x2: cfg.w / 2 - circle_r / 2 / 2 + circle_r / 2,
                        y2: cfg.h / 2 - circle_r / 2
                    });
                    lineArr.push(xy);
                } else if (i === leftNum) {
                    // bottom-left 连线
                    xy.x1 = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180) + cfg.circleData[i].length * 6;
                    xy.y1 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5;
                    xy.x2 = cfg.w / 2 - circle_r / 2 / 2 - (cfg.w / 2 - circle_r / 2 / 2 - xy.x1) / 2;
                    xy.y2 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5;
                    lineArr.push({
                        x1: cfg.w / 2 - circle_r / 2 / 2 - (cfg.w / 2 - circle_r / 2 / 2 - xy.x1) / 2,
                        y1: cfg.h / 2 + (circle_r - 30) * Math.sin(angle2 * Math.PI / 180) - 5,
                        x2: cfg.w / 2 - circle_r / 2 / 2,
                        y2: cfg.h / 2 - circle_r / 2 + circle_r
                    });
                    // bottom-right 连线
                    let lineX1 = cfg.w / 2 + (circle_r - 30) * Math.cos(angle2 * Math.PI / 180) - cfg.circleData[i].length * 5;
                    lineArr.push({
                        x1: lineX1,
                        y1: cfg.h / 2 + (circle_r - 30) * Math.sin(angle2 * Math.PI / 180) - 5,
                        x2: cfg.w / 2 - circle_r / 2 / 2 + circle_r / 2 + (lineX1 - cfg.w / 2 - circle_r / 2 / 2) / 2,
                        y2: cfg.h / 2 + (circle_r - 30) * Math.sin(angle2 * Math.PI / 180) - 5
                    });
                    lineArr.push({
                        x1: lineX1 - (lineX1 - cfg.w / 2 - circle_r / 2 / 2) / 2,
                        y1: cfg.h / 2 + (circle_r - 30) * Math.sin(angle2 * Math.PI / 180) - 5,
                        x2: cfg.w / 2 - circle_r / 2 / 2 + circle_r / 2,
                        y2: cfg.h / 2 - circle_r / 2 + circle_r
                    });
                    lineArr.push(xy);
                } else if (i <= leftNum) {
                    // left 连线
                    //旋转270 - cfg.topAngle(顶部右边角度)-(i[当前item]-1[默认从0开始])*((180-2*cfg.topAngle[去掉上下两个偏移角度])/leftNum)平均每个数据所需的角度
                    xy.x1 = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180) + cfg.circleData[i].length * 6;
                    xy.y1 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5;
                    xy.x2 = cfg.w / 2 - circle_r / 2 / 2;
                    xy.y2 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5;
                    lineArr.push(xy);
                } else if (i > leftNum + 2 && i < cfg.circleData.length - 1) {
                    // right 连线
                    angle = (270 + cfg.topAngle + (i - leftNum - 1 - 1) * (180 - 2 * cfg.topAngle) / leftNum + ((180 - 2 * cfg.topAngle) / leftNum) / 2);
                    xy.x1 = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180) - cfg.circleData[i].length * 6;
                    xy.y1 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5;
                    xy.x2 = cfg.w / 2 - circle_r / 2 / 2 + circle_r / 2;
                    xy.y2 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180) - 5;
                    lineArr.push(xy);
                }
            }
            //构造平行线
            /*for (let i=0;i<circleData.length;i++){
                let xy = {
                    x1:0,
                    y1:0,
                    x2:0,
                    y2:0
                };
                if (i !== 0 && i <= leftNum) {
                    //旋转270 - cfg.topAngle(顶部右边角度)-(i[当前item]-1[默认从0开始])*((180-2*cfg.topAngle[去掉上下两个偏移角度])/leftNum)平均每个数据所需的角度
                    let angle = (270 - cfg.topAngle - (i - 1) * (180 - 2 * cfg.topAngle) / leftNum - ((180 - 2 * cfg.topAngle) / leftNum)/2);
                    xy.x1 = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180) + circleData[i].length*10;
                    xy.y1 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle* Math.PI / 180) - 5;
                    let angle2 = (270 + cfg.topAngle + ((i+leftNum+1) - leftNum - 1 - 1) * (180 - 2 * cfg.topAngle) / leftNum + ((180 - 2 * cfg.topAngle) / leftNum)/2);
                    xy.x2 = cfg.w / 2 + (circle_r - 30) * Math.cos(angle2 * Math.PI / 180) - circleData[i].length*10;
                    xy.y2 = cfg.h / 2 + (circle_r - 30) * Math.sin(angle2 * Math.PI / 180) - 5;
                    lineArr.push(xy);
                }
            }*/
            console.log(lineArr);
            //平行线
            g.selectAll('svg')
                .data(lineArr)
                .enter()
                .append('line')
                .attr("class", "legend")
                .attr("text-anchor", "start")
                .style("stroke", "rgba(253, 233, 153, 0.3)")
                .style("stroke-width", "1px")
                .attr("x1", function (d, i) {
                    return d.x1;
                })
                .attr("y1", function (d, i) {
                    return d.y1;
                })
                .attr("x2", function (d, i) {
                    return d.x2;
                })
                .attr("y2", function (d, i) {
                    return d.y2;
                });
            //中间矩形
            /*g.append("rect")
                .attr("x", cfg.w / 2 - circle_r / 2 / 2)
                .attr("y", cfg.h / 2 - circle_r / 2)
                .attr("width", circle_r / 2)
                .attr("height", circle_r)//每个矩形的高度
                .attr("fill", "#232323")//填充颜色
                .style("fill-opacity", 1);*/
            //中间图片
            g.append("image")
                .attr("x", cfg.w / 2 - circle_r / 2 / 2)
                .attr("y", cfg.h / 2 - circle_r / 2)
                .attr("width", circle_r / 2)
                .attr("height", circle_r)//每个矩形的高度
                .attr("fill", "#232323")//填充颜色
                .style("fill-opacity", 1)
                .attr("href", "./center.jpg");
            // 中心点
            /*g.append("text")
                .attr("x", cfg.w / 2 - 5)
                .attr("y", cfg.h / 2 - 5)
                .style("stroke-width", "1px")
                .style("stroke", "black")
                .style("font-size", "10px")
                .text('人')
                .style("fill-opacity", 1);*/
            //圆点出发数据线
            /*g.selectAll('#contentCircle').data(circleData, function (d, i) {
                return d;
            }).enter()
                .append('line')
                .attr("class", "legend")
                .text(function (d) {
                    return d;
                })
                .attr("text-anchor", "start")
                .style("stroke", "rgba(47, 47, 47, 1)")
                .style("stroke-width", "1px")
                .attr("x1", cfg.w / 2)
                .attr("y1", cfg.h / 2)
                .attr("x2", function (d, i) {
                    let x;
                    if (i === 0) {
                        x = cfg.w / 2;
                    } else if (i <= leftNum) {
                        //旋转270 - cfg.topAngle(顶部右边角度)-(i[当前item]-1[默认从0开始])*((180-2*cfg.topAngle[去掉上下两个偏移角度])/leftNum)平均每个数据所需的角度
                        let angle = (270 - cfg.topAngle - (i - 1) * (180 - 2 * cfg.topAngle) / leftNum - ((180 - 2 * cfg.topAngle) / leftNum)/2);
                        x = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180);
                    } else if (i === leftNum + 1) {
                        x = cfg.w / 2;
                    } else {
                        //270 旋转270 + cfg.topAngle(顶部右边角度)+(i[当前item]-leftNum[左边显示数量]-1[底部数据右边角度]-1[默认从0开始])
                        let angle = (270 + cfg.topAngle + (i - leftNum - 1 - 1) * (180 - 2 * cfg.topAngle) / leftNum + ((180 - 2 * cfg.topAngle) / leftNum)/2);
                        x = cfg.w / 2 + (circle_r - 30) * Math.cos(angle * Math.PI / 180);
                    }
                    return x;
                })
                .attr("y2", function (d, i) {
                    let y;
                    if (i === 0) {
                        y = cfg.h / 2 + (circle_r - 30) * Math.sin(270 * Math.PI / 180);
                    } else if (i <= leftNum) {
                        y = cfg.h / 2 + (circle_r - 30) * Math.sin((270 - cfg.topAngle - (i - 1) * (180 - 2 * cfg.topAngle) / leftNum - ((180 - 2 * cfg.topAngle) / leftNum)/2) * Math.PI / 180);
                    } else if (i === leftNum + 1) {
                        y = cfg.h / 2 + (circle_r - 30) * Math.sin(90 * Math.PI / 180);
                    } else {
                        //270 旋转270 + cfg.topAngle(顶部右边角度)+(i[当前item]-leftNum[左边显示数量]-1[底部数据右边角度]-1[默认从0开始])
                        let angle = (270 + cfg.topAngle + (i - leftNum - 1 - 1) * (180 - 2 * cfg.topAngle) / leftNum + ((180 - 2 * cfg.topAngle) / leftNum)/2);
                        y = cfg.h / 2 + (circle_r - 30) * Math.sin(angle * Math.PI / 180);
                    }
                    return y;
                });*/
        }
    },
    pie: function (options) {
        let cfg = {
            id: '',
            data: null,
            w: 300,
            h: 300,
            margin: {top: 100, right: 100, bottom: 100, left: 100},
            innerRadius:40,
            outerRadius:100,
            scaleX:1,
            scaleY:1,
        };
        if ('undefined' !== typeof options) {
            for (let i in options) {
                if ('undefined' !== typeof options[i]) {
                    cfg[i] = options[i];
                }
            }
        }
        let svg = d3.select(cfg.id)
            .append("svg")
            .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("transform", "scale(" + cfg.scaleX + "," + cfg.scaleY + ")");
        let g = svg.append("g")
            .attr("transform","translate(" + (cfg.w + cfg.margin.left + cfg.margin.right)/2 + "," + (cfg.h + cfg.margin.top + cfg.margin.bottom)/2 + ")");
        //扇形
        let arc_generator = d3.svg.arc().innerRadius(cfg.innerRadius).outerRadius(cfg.outerRadius);
        //圆
        let data_generator = d3.layout.pie()
            .value(function(d){return d.value;});
        //let color = d3.scale.category10();
        let color = function (i) {
            let c = ['#775BD2','#B34E38','#A8985E','#498F5A','#5168AB'];
            return c[i%5];
        };
        g.selectAll("path")
            .data(data_generator(cfg.data))
            .enter()
            .append("path")
            .attr("d", arc_generator)
            .style("fill",function(d,i){return color(i)})//给不同的扇形区填充不同的颜色
        g.selectAll("text")//给每个扇形去添加对应文字
            .data(data_generator(cfg.data))
            .enter()
            .append("text")
            .style("fill", "white")
            .style("stroke", "white")
            .style("font-size", "11px")
            .style("font-weight", "100")
            .text(function(d,i){
                console.log(i);
                return '%'+cfg.data[i].value;
            })
            .attr("transform",function(d){return "translate("+arc_generator.centroid(d)+")"})//调成每个文字的对应位置
            .attr("text-anchor","middle")//是文字居中
    },
    point: function (options) {
        let cfg = {
            id: '',
            data: null,
            w: 300,
            h: 300,
            margin: {top: 100, right: 100, bottom: 100, left: 100},
            r:20,
            scaleX:0.8,
            scaleY:0.8,
            sectorWidth:40,
            diff:10,
            sectorTwoWidth:2,
            diffTwo:30
        };
        if ('undefined' !== typeof options) {
            for (let i in options) {
                if ('undefined' !== typeof options[i]) {
                    cfg[i] = options[i];
                }
            }
        }
        let svg = d3.select(cfg.id)
            .append("svg")
            .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("transform", "scale(" + cfg.scaleX + "," + cfg.scaleY + ")");

        function random(lower, upper) {
            return Math.floor(Math.random() * (upper - lower+1)) + lower;
        }

        /**
         * 第一层扇形
         * @type {(function(): *)|(function(): *)|arc}
         */
        let leftArc = d3.svg.arc().outerRadius(cfg.r+cfg.diff+cfg.sectorWidth).innerRadius(cfg.r+cfg.diff).startAngle(0).endAngle(1.4707963267948966);
        let rightArc = d3.svg.arc().outerRadius(cfg.r+cfg.diff+cfg.sectorWidth).innerRadius(cfg.r+cfg.diff).startAngle(1.5707963267948966).endAngle(3.041592653589793);//2.65 1.73
        let topArc = d3.svg.arc().outerRadius(cfg.r+cfg.diff+cfg.sectorWidth).innerRadius(cfg.r+cfg.diff).startAngle(3.141592653589793).endAngle(4.61238898038469);//
        let bottomArc = d3.svg.arc().outerRadius(cfg.r+cfg.diff+cfg.sectorWidth).innerRadius(cfg.r+cfg.diff).startAngle(4.71238898038469).endAngle(6.183185307179586);
        /**
         * 第二层扇形
         * @type {(function(): *)|(function(): *)|arc}
         */
        let leftArc2 = d3.svg.arc().outerRadius(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo+cfg.sectorTwoWidth).innerRadius(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo).startAngle(0).endAngle(1.9707963267948966);
        let bottomArc2 = d3.svg.arc().outerRadius(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo+cfg.sectorTwoWidth).innerRadius(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo).startAngle(1.9707963267948966).endAngle(3.141592653589793);//
        let topArc2 = d3.svg.arc().outerRadius(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo+cfg.sectorTwoWidth).innerRadius(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo).startAngle(3.141592653589793).endAngle(5.11238898038469);//
        let rightAr2 = d3.svg.arc().outerRadius(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo+cfg.sectorTwoWidth).innerRadius(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo).startAngle(5.11238898038469).endAngle(6.283185307179586);//
        let g = svg.append("g");
        for(let i=0;i<cfg.data.length;i++){
            let x = random(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo+cfg.sectorTwoWidth,cfg.w+cfg.margin.left+cfg.margin.right-(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo+cfg.sectorTwoWidth));
            let y = random(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo+cfg.sectorTwoWidth,cfg.h+cfg.margin.top+cfg.margin.bottom-(cfg.r+cfg.diff+cfg.sectorWidth+cfg.diffTwo+cfg.sectorTwoWidth));
            //点
            g.append("circle")
                .style("fill", "#FDE999")
                .style('stroke', "#FDE999")
                .style('stroke-width', "#FDE999")
                .style('cursor', "pointer")
                .attr("class", 'node')
                .attr("r", function (node, i) {
                    return cfg.r;
                })
                .attr("cx", function (node, i) {
                    return x;
                })
                .attr("cy", function (node, i) {
                    return y;
                });
            //右上 扇形
            g.append("path")
                .style('stroke-opacity', 0)
                .style("fill-opacity", 0)
                .style('cursor', "pointer")
                .attr("class", 'node')
                .attr("d", leftArc)
                .attr('transform','translate('+x+','+y+')');
            g.append('text')
                .style("fill", "white")
                .style("stroke", "white")
                .style("stroke-width", ".3px")
                .style("font-size", "12px")
                //.style("writing-mode", "tb")//垂直显示
                .text(function (d) {
                    return "参与"
                })
                .attr('dx', function (d, i) {
                    return leftArc.centroid(d)[0];
                })
                .attr('dy', function (d, i) {
                    return leftArc.centroid(d)[1];
                })
                .attr('transform','translate('+x+','+y+')');
            //左下 扇形
            g.append("path")
                .style('stroke-opacity', 0)
                .style("fill-opacity", 0)
                .style('cursor', "pointer")
                .attr("class", 'node')
                .attr("d", topArc)
                .attr('transform','translate('+x+','+y+')');
            g.append('text')
                .style("fill", "white")
                .style("stroke", "white")
                .style("stroke-width", ".3px")
                .style("font-size", "12px")
                .text('交易')
                .attr('dx',function (d,i) {
                    return topArc.centroid(d)[0]-15;
                })
                .attr('dy',function (d,i) {
                    return topArc.centroid(d)[1]+15;
                })
                .attr('transform','translate('+x+','+y+')');
            //右下 扇形
            g.append("path")
                .style("fill", "#494736")
                .style('stroke', "#494736")
                .style('stroke-width', "#494736")
                .style('cursor', "pointer")
                .attr("class",'node')
                .attr("d", rightArc)
                .attr('transform','translate('+x+','+y+')');
            //左上 扇形
            g.append("path")
                .style("fill", "#494736")
                .style('stroke', "#494736")
                .style('stroke-width', "#494736")
                .style('cursor', "pointer")
                .attr("class",'node')
                .attr("d", bottomArc)
                .attr('transform','translate('+x+','+y+')');
            //右上 扇形线条
            g.append("path")
                .style("fill", "#494736")
                .style('stroke', "#494736")
                .style('stroke-width', "#494736")
                .style('cursor', "pointer")
                .attr("class",'node')
                .attr("d", leftArc2)
                .attr('transform','translate('+x+','+y+')');
            //左下 扇形线条
            g.append("path")
                .style("fill", "#494736")
                .style('stroke', "#494736")
                .style('stroke-width', "#494736")
                .style('cursor', "pointer")
                .attr("class",'node')
                .attr("d", topArc2)
                .attr('transform','translate('+x+','+y+')');

            g.append("path")
                .style('stroke-opacity', 0)
                .style("fill-opacity", 0)
                .style('cursor', "pointer")
                .attr("class",'node')
                .attr("d", rightAr2)
                .attr('transform','translate('+x+','+y+')');

            g.append("path")
                .style('stroke-opacity', 0)
                .style("fill-opacity", 0)
                .style('cursor', "pointer")
                .attr("class",'node')
                .attr("d", bottomArc2)
                .attr('transform','translate('+x+','+y+')');
            //左上 扇形线条 文字
            g.append('text')
                .style("fill", "white")
                .style("stroke", "white")
                .style("stroke-width", ".3px")
                //.style("writing-mode", "tb")//垂直显示
                .text(function (d,i) {
                    return i;
                })
                .attr('dx',function (d,i) {
                    //return -cfg.r-cfg.diff-cfg.sectorWidth;
                    return rightAr2.centroid(d)[0]-10;
                })
                .attr('dy',function (d,i) {
                    //return -cfg.r-cfg.diff-cfg.sectorWidth;
                    return rightAr2.centroid(d)[1]+10;
                })
                .attr('transform','translate('+x+','+y+')');
            //右下 扇形线条 文字
            g.append('text')
                .style("fill", "white")
                .style("stroke", "white")
                .style("stroke-width", ".3px")
                .text(function (d,i) {
                    return i;
                })
                .attr('dx',function (d,i) {
                    //return cfg.r+cfg.diff+cfg.sectorWidth-15;
                    return bottomArc2.centroid(d)[0];
                })
                .attr('dy',function (d,i) {
                    //return cfg.r+cfg.diff+cfg.sectorWidth+15;
                    return bottomArc2.centroid(d)[1];
                })
                .attr('transform','translate('+x+','+y+')');
        }
    }
};
