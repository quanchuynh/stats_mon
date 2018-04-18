import React from 'react'
import './FixedControlPannel.css'

const fixedControlPannel = (props) => {
  return (
  <div class="fixed-button-3">
    <h3  align="center"><a href="#" title={props.description} class="xref_text">{props.title}</a></h3>
    <div class="row">
       <div class="col-sm-1"></div>
    </div>
  </div>
  );
}

