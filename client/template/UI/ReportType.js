import React, {Component} from 'react'
import ReportTypeOption from './ReportTypeOption';

class reportTypeReact extends Component {
  reportTypeExplain = () => {
    return msg;
  }

  render() {
    const explanation = "Monthly Report will generate summation of activities for each month within the given duration.\n" +
              "  If the duration spans multiple years, year-over-year reports also generated for comparison.\n" +
              "Daily Report will generate summation of activities for each day within the given duration.\n";
    return (
      <div>
        <a href="#" title={explanation}>Report Type</a>
        <ReportTypeOption/>
      </div>
    );
  }
}

export default reportTypeReact;
