'use strict';

const React = require('react');

module.exports = React.createClass({

  displayName: 'AxisControls',

  propTypes: {
    scale: React.PropTypes.func.isRequired,
    orient: React.PropTypes.oneOf(['top', 'bottom', 'left', 'right']).isRequired,
    controlOrient: React.PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    orient2nd: React.PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    height: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    horizontal: React.PropTypes.bool,
    controlArguments: React.PropTypes.array,
    controlValues: React.PropTypes.array,
    innerControlSize: React.PropTypes.number,
    outerControlSize: React.PropTypes.number,
    controlPadding: React.PropTypes.number,
    controlFormat: React.PropTypes.func,
    controlStroke: React.PropTypes.string,
    controlStrokeWidth: React.PropTypes.number,
    controlStrokeDash: React.PropTypes.string,
  },
  getDefaultProps() {
    return {
      innerControlSize: 6,
      outerControlSize: 6,
      controlStroke: '#D8D7D7',
      controlStrokeWidth: 1,
      controlStrokeDash: '5, 5',
      controlPadding: 3,
      controlArguments: [10],
      controlValues: null
    };
  },

  render() {
    const props = this.props;

    let tr;
    let textAnchor;
    let textTransform;
    let controlFormat;
    let y1;
    let y2;
    let dy;
    let x1;
    let x2;

    let x2grid;
    let y2grid;

    const sign = props.controlOrient === 'top' || props.controlOrient === 'right' ? -1 : 1;
    const controlSpacing = Math.max(props.innerControlSize, 0) + props.controlPadding;

    const scale = props.scale;

    let controls;
    if (props.controlValues) {
      controls = props.controlValues;
    } else if (scale.controls) {
      controls = scale.controls.apply(scale, props.controlArguments);
    } else {
      controls = scale.domain();
    }

    if (props.controlFormatting) {
      controlFormat = props.controlFormatting;
    } else if (scale.controlFormat) {
      controlFormat = scale.controlFormat.apply(scale, props.controlArguments);
    } else {
      controlFormat = (d) => d;
    }

    const adjustedScale = scale.rangeBand ? d => scale(d) + scale.rangeBand() / 2 : scale;

    // FIX LATER
    tr = (control) => `translate(${props.width},${adjustedScale(control)})`;
    textAnchor = 'start';
    x2 = props.innerControlSize * -sign;
    x1 = controlSpacing * -sign;
    dy = '.32em';
    x2grid = -props.width;
    y2grid = 0;

    // return grid line if grid is enabled and grid line is not on at same position as other axis.
    const gridLine = (pos) => {
      return (
        <line style={{
          strokeWidth: props.controlStrokeWidth,
          shapeRendering: 'crispEdges',
          stroke: props.controlStroke,
          strokeDasharray: props.controlStrokeDash,
        }} x2={x2grid} y2={y2grid}
        />
      );
    };

    const optionalTextProps = textTransform ? {
      transform: textTransform,
    } : {};

    return (
    <g>
      {controls.map((control, idx) => (
          <g key={idx} className="control" transform={tr(control)} >
            {gridLine(adjustedScale(control))}
            <text
              strokeWidth="0.01"
              dy={dy} x={x1} y={y1}
              style={{ stroke: props.controlTextStroke, fill: props.controlTextStroke }}
              textAnchor={textAnchor}
              {...optionalTextProps}
            >
              {controlFormat(control)}
            </text>
          </g>
        ))
      }
    </g>
    );
  },
});
