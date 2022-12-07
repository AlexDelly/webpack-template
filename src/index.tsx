import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/styles";
import "./styles/less.less";
import "./styles/scss.scss";

interface AppProps {
  title: string;
  less: string;
  scss: string;
}

const App = ({ title, less, scss }: AppProps) => {
  return (
    <div className="container">
      <h1>{title}</h1>
      <div className="logo-container">
        <a className="link" href="https://webpack.js.org/" target="_blank">
          <div className="logo">&nbsp;</div>
        </a>
      </div>
      <div className="less">
        <a className="link" href="https://lesscss.org/" target="_blank">
          <h2>{less}</h2>
        </a>
      </div>
      <div className="scss">
        <a className="link" href="https://sass-lang.com/" target="_blank">
          <h2>{scss}</h2>
        </a>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<App title="Webpack template" less="less" scss="scss" />);
