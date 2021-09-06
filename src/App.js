import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Doc from "./components/Document";

function App() {
  const [documents, setDocuments] = useState([]);
  useEffect(() => {
    const getData = async () => {
      const res = await fetch(`https://menu.classforma.com:5000/get_docs/`);
      const data = await res.json();
      setDocuments(data);
      console.log("ksajdf");
    };
    getData();
  }, []);

  return (
    <Router>
      <Route exact path="/">
        <div className="App">
          <h1>Documents</h1>
          <ul>
            {documents.map((item) => {
              return (
                <Link to={`/document/${item._id}`}>
                  <li>{item.filename}</li>
                </Link>
              );
            })}
          </ul>
        </div>
      </Route>
      <Route path="/document/:id" exact component={Doc} />
    </Router>
  );
}

export default App;
