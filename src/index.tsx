import { ScenarioHostApp } from '@axinom/mosaic-fe-samples-host';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import reportWebVitals from './reportWebVitals';
import { scenarios } from './scenario-registry';

ReactDOM.render(
  <ScenarioHostApp scenarios={scenarios} />,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
