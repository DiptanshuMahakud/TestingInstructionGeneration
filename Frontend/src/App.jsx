import { useState } from "react";
import axios from "axios";
import "./index.css";

const App = () => {
  const [images, setImages] = useState([]);
  const [context, setContext] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleContextChange = (e) => {
    setContext(e.target.value);
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    images.forEach((image) => formData.append("images", image));
    formData.append("context", context);

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/generate_instrutions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setInstructions(response.data.instructions);
    } catch (error) {
      console.error("Error generating instructions:", error);
      alert(
        "There was an error generating the instructions. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text) => {
    const boldText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    const formattedText = boldText.replace(/\n/g, "<br />");

    return formattedText;
  };

  return (
    <div className="app flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-6">Test Instruction Generator</h1>

      <textarea
        className="border p-2 mb-4 w-full max-w-md"
        placeholder="Optional: Enter context"
        value={context}
        onChange={handleContextChange}
      />

      <input
        className="border p-2 mb-4"
        type="file"
        multiple
        onChange={handleFileChange}
      />

      <button
        className="bg-blue-500 text-white p-2 hover:bg-blue-700"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : "Generate Instructions"}
      </button>

      {isLoading && (
        <div className="mt-4 text-blue-500">Processing... Please wait.</div>
      )}

      {instructions && (
        <div
          className="mt-6 p-4 border w-full max-w-md whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatText(instructions) }}
        >
          {}
        </div>
      )}
    </div>
  );
};

export default App;
