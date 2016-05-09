'use strict';

const React = require('react');
const d3 = require('d3');
const VoronoiCircleContainer = require('./VoronoiCircleContainer');
const Line = require('./Line');

module.exports = React.createClass({

  displayName: 'DataSeries',

  propTypes: {
    color: React.PropTypes.func,
    colorAccessor: React.PropTypes.func,
    data: React.PropTypes.array,
    interpolationType: React.PropTypes.string,
    xAccessor: React.PropTypes.func,
    yAccessor: React.PropTypes.func,
    hoverAnimation: React.PropTypes.bool,
    lineGradient: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      data: [],
      xAccessor: (d) => d.x,
      yAccessor: (d) => d.y,
      interpolationType: 'linear',
      hoverAnimation: false,
      lineGradient: false
    };
  },

  _createGradient(series, idx) {
    const props = this.props;

    const xSeries = _.map(series.values, function(value) {
      if (Object.prototype.toString.call(props.xAccessor(value)) === '[object Date]') {
        return props.xScale(props.xAccessor(value).getTime());
      } else {
        return props.xScale(props.xAccessor(value));
      }
    });

    const min = Math.min( ...xSeries );
    const max = Math.max( ...xSeries );

    const gradientSteps = _.map(series.values, function(value) {
      let xValue;
      if (Object.prototype.toString.call(props.xAccessor(value)) === '[object Date]') {
        xValue = props.xScale(props.xAccessor(value).getTime());
      } else {
        xValue = props.xScale(props.xAccessor(value));
      }

      return {
        step: 100 * ( (xValue - min) / (max - min) ),
        color: props.colors(props.colorAccessor({
          point: {
            d: value
          }
        }))
      };
    });

    let uniqueDate = new Date().getTime();

    return (
      <linearGradient key={`line-gradient-${idx}-${uniqueDate}`} id={`line-gradient-${idx}-${uniqueDate}`} x1="0%" x2="100%" y1="0%" y2="0%" gradientUnits="objectBoundingBox" spreadMethod="pad">
        {
          gradientSteps.length ? gradientSteps.map(function(step) {
            return (
              <stop key={step.step} offset={step.step + "%"} stopColor={step.color} />
            );
          }) : ''
        }
      </linearGradient>
    );
  },

  _isDate(d, accessor) {
    return Object.prototype.toString.call(accessor(d)) === '[object Date]';
  },

  render() {
    const props = this.props;
    const xScale = props.xScale;
    const yScale = props.yScale;
    const xAccessor = props.xAccessor;
    const yAccessor = props.yAccessor;

    const interpolatePath = d3.svg.line()
        .y((d) => props.yScale(yAccessor(d)))
        .interpolate(props.interpolationType);

    if (this._isDate(props.data[0].values[0], xAccessor)) {
      interpolatePath.x(d => props.xScale(props.xAccessor(d).getTime()));
    } else {
      interpolatePath.x(d => props.xScale(props.xAccessor(d)));
    }

    let gradients = [];
    const lines = props.data.map((series, idx) => {
      let lineGradient = false;
      if (props.lineGradient) {
        lineGradient = this._createGradient(series, idx);
        gradients.push(lineGradient);
      }

      return (
        <Line
          path={interpolatePath(series.values)}
          stroke={ props.lineGradient ? "url(#" + lineGradient.props.id + ")" : props.colors(props.colorAccessor(series, idx)) }
          strokeWidth={series.strokeWidth}
          strokeDashArray={series.strokeDashArray}
          seriesName={series.name}
          key={idx}
        />
      )
    });

    const voronoi = d3.geom.voronoi()
      .x(d => xScale(d.coord.x))
      .y(d => yScale(d.coord.y))
      .clipExtent([[0, 0], [props.width, props.height]]);

    let cx;
    let cy;
    let circleFill;
    const regions = voronoi(props.value).map((vnode, idx) => {
      const point = vnode.point.coord;
      if (Object.prototype.toString.call(xAccessor(point)) === '[object Date]') {
        cx = props.xScale(xAccessor(point).getTime());
      } else {
        cx = props.xScale(xAccessor(point));
      }
      if (Object.prototype.toString.call(yAccessor(point)) === '[object Date]') {
        cy = props.yScale(yAccessor(point).getTime());
      } else {
        cy = props.yScale(yAccessor(point));
      }
      circleFill = props.colors(props.colorAccessor(vnode, vnode.point.seriesIndex));

      return (
        <VoronoiCircleContainer
          key={idx}
          circleFill={circleFill}
          vnode={vnode}
          hoverAnimation={props.hoverAnimation}
          cx={cx} cy={cy}
          circleRadius={props.circleRadius}
          onMouseOver={props.onMouseOver}
          dataPoint={{
            xValue: xAccessor(point),
            yValue: yAccessor(point),
            seriesName: vnode.point.series.name,
          }}
        />
      );
    });

    return (
      <g>
        <g>{regions}</g>
        <g>{lines}</g>
        <g>{gradients}</g>
      </g>
    );
  },
});
