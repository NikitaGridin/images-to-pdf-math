import { jsPDF } from "jspdf";
import { useState } from "react";

export const App = () => {
  const [images, setImages] = useState([]);

  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files);
    const newImages: any = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = String(e.target?.result);
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg; // Red
              data[i + 1] = avg; // Green
              data[i + 2] = avg; // Blue
            }
            ctx.putImageData(imageData, 0, 0);
            const url = canvas.toDataURL("image/jpeg");
            newImages.push(url);
            if (newImages.length === files.length) {
              setImages(newImages);
            }
          }
        };
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const generatePDF = () => {
    const pdf = new jsPDF();

    const loadImage = (src: any) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    const promises = images.map((image) => loadImage(image));

    // Ждем загрузки всех изображений
    Promise.all(promises)
      .then((loadedImages) => {
        loadedImages.forEach((image: any, i) => {
          if (i !== 0) {
            pdf.addPage();
          }

          const aspectRatio = image.width / image.height;
          const width = pdf.internal.pageSize.getWidth(); // Ширина документа
          const height = width / aspectRatio; // Вычисляем соответствующую высоту
          pdf.addImage(
            image,
            "JPEG",
            0, // X координата
            0, // Y координата
            width, // Новая ширина
            height // Новая высота
          );

          if (i === loadedImages.length - 1) {
            pdf.save("images.pdf");
          }
        });
      })
      .catch((error) => {
        console.error("Ошибка при загрузке изображения:", error);
      });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={{ marginBottom: "10px" }}
      />
      <button
        onClick={generatePDF}
        style={{
          backgroundColor: "#4CAF50",
          border: "none",
          color: "white",
          padding: "15px 32px",
          textAlign: "center",
          textDecoration: "none",
          display: "inline-block",
          fontSize: "16px",
          margin: "4px 2px",
          cursor: "pointer",
          borderRadius: "8px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        Generate PDF
      </button>
      <div
        style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}
      >
        {images.map((image, i) => (
          <div key={i} style={{ margin: "10px", textAlign: "center" }}>
            <img
              src={image}
              alt={`image-${i}`}
              width={200}
              style={{
                display: "block",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
