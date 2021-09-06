import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import styles from "../styles/document.module.css";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Doc = () => {
  const { id } = useParams();
  const [doc, setDocument] = useState("");
  const selected = useRef(null);
  const [boxes, setBoxes] = useState([]);
  const [numPages, setNumPages] = useState(null);
  function initDraw(canvas) {
    function setMousePosition(e) {
      var ev = e || window.event; //Moz || IE
      if (ev.pageX) {
        //Moz
        mouse.x = ev.pageX + window.pageXOffset;
        mouse.y = ev.pageY + window.pageYOffset;
      } else if (ev.clientX) {
        //IE
        mouse.x = ev.clientX + document.body.scrollLeft;
        mouse.y = ev.clientY + document.body.scrollTop;
      }
    }

    var mouse = {
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
    };
    var element = null;

    canvas.onmousemove = function (e) {
      setMousePosition(e);
      if (element !== null) {
        element.style.width =
          Math.abs(mouse.x - mouse.startX) - window.pageXOffset + "px";
        element.style.height =
          Math.abs(mouse.y - mouse.startY) - window.pageYOffset + "px";
        element.style.left =
          mouse.x - mouse.startX < 0 ? mouse.x + "px" : mouse.startX + "px";
        element.style.top =
          mouse.y - mouse.startY < 0 ? mouse.y + "px" : mouse.startY + "px";
      }
    };

    canvas.onclick = function (e) {
      if (element !== null) {
        element = null;
        canvas.style.cursor = "default";
        console.log("finished.");
        console.log(mouse);
        setBoxes(
          boxes.concat({
            x: mouse.startX,
            y: mouse.startY,
            height:
              Math.abs(mouse.y - mouse.startY) - window.pageYOffset + "px",
            width: Math.abs(mouse.x - mouse.startX) - window.pageXOffset + "px",
            label: selected.current,
          })
        );
      } else {
        console.log("begun.");
        mouse.startX = mouse.x - window.pageXOffset;
        mouse.startY = mouse.y - window.pageYOffset;
        element = document.createElement("div");
        element.className =
          selected.current === "name" ? styles.rectangle : styles.rectangleTele;
        element.style.zIndex = "999";
        element.style.left = mouse.x + "px";
        element.style.top = mouse.y + "px";
        canvas.appendChild(element);
        canvas.style.cursor = "crosshair";
      }
    };
  }

  useEffect(() => {
    const getData = async () => {
      const res = await fetch(
        ` https://menu.classforma.com:5000/get_doc/${id}/`
      );
      const data = await res.json();
      setDocument(await data);
      console.log(data.contents);
    };
    getData();
  }, [id]);

  return (
    <div className={styles.main}>
      <div className={styles.left}>
        <div className={styles.label}>
          <h1>Labels</h1>
          <hr />
          <label className={styles.name} for="name">
            <input
              type="radio"
              name="plan"
              id="name"
              onClick={() => {
                selected.current = "name";
                console.log(selected);

                initDraw(document.getElementById("canvas"));
              }}
            />
            Name
          </label>
          <label className={styles.tele} for="tele">
            <input
              type="radio"
              id="tele"
              name="plan"
              onClick={async () => {
                selected.current = "tele";
                console.log(selected);
                initDraw(document.getElementById("canvas"));
              }}
            />
            Telephone
          </label>
        </div>
        <div className={styles.boxes}>
          <h1>Boxes</h1>
          <hr />
          {console.log(boxes)}
          {boxes.map((item) => {
            return (
              <div className={styles.boxesitem}>
                <p>- x: {item.x},</p>
                <p>y: {item.y},</p>
                <p>height: {item.height},</p>
                <p>width: {item.width},</p>
                {item.label === "name" ? (
                  <label className={styles.name}>Name</label>
                ) : (
                  <label className={styles.tele}>Telephone</label>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.right} id="canvas">
        <Document
          file={`data:application/pdf;base64,${doc.contents}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {Array.apply(null, Array(numPages))
            .map((x, i) => i + 1)
            .map((page) => (
              <Page pageNumber={page} className={styles.pdf} />
            ))}
        </Document>
      </div>
    </div>
  );
};
export default Doc;
