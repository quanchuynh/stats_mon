import React, {Component} from 'react'

const reportTypeOption = () => {
    handleChange = (evt) => {
      console.debug("New value: " + evt.target.value);
      GlobalState.updateReportType(evt.target.value);
    }

    return (
        <span>
          <select className="input-xlarge" id="report-type-item" onChange={this.handleChange}>
             <option value="month">Monthly Report</option>
             <option value="day">Daily Report</option>
          </select>
        </span>
    );
}

export default reportTypeOption;
