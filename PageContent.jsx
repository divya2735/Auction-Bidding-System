import React from "react";

const PageContent = ({ title, content }) => (
  <div className="bg-gray-800 p-8 rounded-lg shadow-xl min-h-full">
    <h1 className="text-3xl font-bold mb-6 text-white">{title}</h1>
    <div className="text-gray-300">{content}</div>
  </div>
);

export default PageContent;
