##通过d3自定义图表插件

###支持参数列表
```$xslt
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
        }
```

###初始化方法
```$xslt
let div = '#chart';
    let data = [
        [
            {axis: "学历", value: 10},
            {axis: "综合", value: 11.6},
            {axis: "风险", value: 11.8},
            {axis: "抗压", value: 10},
            {axis: "消费", value: 12},
            {axis: "流水", value: 12},
            {axis: "车辆", value: 10},
            {axis: "房产", value: 12},
            {axis: "履约", value: 10},
            {axis: "负债", value: 12},
            {axis: "收入", value: 12},
        ]
    ];
    let tempData = [
        '上官婉儿',
        '女',
        '中国江苏省扬州市',
        '画家',
        '爱好收藏名画',
        '已婚已育',
        '百万家产',
        '中产阶级',
        'f',
        '一儿一女',
        '自由职业者',
        '17800966880',
        '24岁',
        '25岁',
    ];
    let width = 400,
        //width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = 400;
        //height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
    Chart.radar({
        w: width,
        h: height,
        levels: 6,
        showLevels: 2,
        data: data,
        circleData: tempData,
        id: div
    });
```

