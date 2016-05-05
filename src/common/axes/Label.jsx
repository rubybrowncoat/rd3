'use strict';

const React = require('react');

module.exports = React.createClass({

  displayName: 'Label',

  propTypes: {
    height: React.PropTypes.number,
    horizontalChart: React.PropTypes.bool,
    horizontalTransform: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    fallen: React.PropTypes.bool,
    width: React.PropTypes.number,
    strokeWidth: React.PropTypes.number,
    textAnchor: React.PropTypes.string,
    verticalTransform: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      horizontalTransform: 'rotate(270)',
      fallen: false,
      strokeWidth: 0.01,
      textAnchor: 'middle',
      verticalTransform: 'rotate(0)',
    };
  },

  render() {
    const props = this.props;

    if (!props.label) {
      return <text />;
    }

    let transform;
    let x;
    let y;
    let textAnchor = props.textAnchor;
    if (props.orient === 'top' || props.orient === 'bottom') {
      transform = props.verticalTransform;
      x = props.width / 2;
      y = props.offset;

      if (props.horizontalChart) {
        transform = `rotate(180 ${x} ${y}) ${transform}`;
      }

      if (props.fallen) {
        x = 0;
        textAnchor = 'left';
      }
    } else {  // left, right
      transform = props.horizontalTransform;
      x = -props.height / 2;
      if (props.orient === 'left') {
        y = -props.offset;
      } else {
        y = props.offset;
      }

      if (props.fallen) {
        x = -props.height;
        textAnchor = 'left';
      }
    }


    return (
      <text
        strokeWidth={props.strokeWidth.toString()}
        textAnchor={textAnchor}
        transform={transform}
        y={y}
        x={x}
      >
        {props.label}
      </text>
    );
  },
});
