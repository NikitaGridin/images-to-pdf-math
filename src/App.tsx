import { jsPDF } from "jspdf";
import { useState } from "react";

export const App = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: any) => {
    setIsLoading(true);
    const files = Array.from(e.target.files);
    const newImages: any = [];
    files.forEach((file: any) => {
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
              setIsLoading(false);
            }
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageReorder = (oldIndex: number, newIndex: number) => {
    const reorderedImages = [...images];
    const movedImage = reorderedImages.splice(oldIndex, 1)[0];
    reorderedImages.splice(newIndex, 0, movedImage);
    setImages(reorderedImages);
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

    Promise.all(promises)
      .then((loadedImages) => {
        loadedImages.forEach((image: any, i) => {
          if (i !== 0) {
            pdf.addPage();
          }

          const aspectRatio = image.width / image.height;
          const width = pdf.internal.pageSize.getWidth();
          const height = width / aspectRatio;
          pdf.addImage(image, "JPEG", 0, 0, width, height);

          if (i === loadedImages.length - 1) {
            pdf.save("images.pdf");
          }
        });
      })
      .catch((error) => {
        console.error("Ошибка при загрузке изображения:", error);
      });
  };

  if (isLoading) return <div style={{ textAlign: "center" }}>Loading...</div>;

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
      <div>
        {images.map((image, i) => (
          <div
            key={i}
            style={{
              margin: "10px",
              textAlign: "center",
              position: "relative",
            }}
          >
            <img
              src={image}
              alt={`image-${i}`}
              width={200}
              style={{
                display: "block",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                cursor: "move",
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("index", String(i));
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dragIndex = e.dataTransfer.getData("index");
                handleImageReorder(+dragIndex, i);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
