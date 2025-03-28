import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import Footer from "./Footer";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";

const javascriptDefault = `/**
* Problem: Binary Search: Search a sorted array for a target value.
*/

// Time: O(log n)
const binarySearch = (arr, target) => {
 return binarySearchHelper(arr, target, 0, arr.length - 1);
};

const binarySearchHelper = (arr, target, start, end) => {
 if (start > end) {
   return false;
 }
 let mid = Math.floor((start + end) / 2);
 if (arr[mid] === target) {
   return mid;
 }
 if (arr[mid] < target) {
   return binarySearchHelper(arr, target, mid + 1, end);
 }
 if (arr[mid] > target) {
   return binarySearchHelper(arr, target, start, mid - 1);
 }
};

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const target = 5;
console.log(binarySearch(arr, target));
`;

const Landing = () => {
  const [code, setCode] = useState(javascriptDefault);
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (selectedLanguage) => {
    console.log("Selected Language:", selectedLanguage);
    setLanguage(selectedLanguage);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      handleReview();
    }
  }, [ctrlPress, enterPress]);

  const onChange = (action, data) => {
    if (action === "code") {
      setCode(data);
    } else {
      console.warn("Unhandled action:", action);
    }
  };

  const handleReview = () => {
    if (!code) {
      showErrorToast("Please provide some code to review!");
      return;
    }

    setProcessing(true);

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Give me JSON format where first part will contain my code output and second part will contain the code review. Please review the following JavaScript code for errors, optimizations, and best practices. Provide feedback on improvements:\n\n${code}`,
            },
          ],
        },
      ],
    };

    const options = {
      method: "POST",
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBnDS9uqp-6V6BF2NY05ApakGuAwEALWMw",
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
      mode: "no-cors",
    };

    axios
      .request(options)
      .then((response) => {
        console.log("Gemini API Response:", response.data.candidates[0].content.parts[0].text);
        setOutputDetails(response.data.candidates[0].content.parts[0].text); // Display the response in the OutputWindow
        showSuccessToast("Code reviewed successfully!");
        setProcessing(false);
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.error?.message || err.message || "Something went wrong!";
        console.error("Error:", err.response || err);
        showErrorToast(errorMessage);
        setProcessing(false);
      });
  };

  const handleThemeChange = (selectedTheme) => {
    if (["light", "vs-dark"].includes(selectedTheme.value)) {
      setTheme(selectedTheme);
    } else {
      defineTheme(selectedTheme.value).then(() => setTheme(selectedTheme));
    }
  };

  useEffect(() => {
    defineTheme("oceanic-next").then(() =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  const showSuccessToast = (message) => {
    toast.success(message || "Operation Successful!", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const showErrorToast = (message) => {
    toast.error(message || "Something went wrong!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <>
      <ToastContainer />
      <div className="h-4 w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"></div>
      <div className="flex flex-row">
        <div className="px-4 py-2">
          <LanguagesDropdown onSelectChange={onSelectChange} />
        </div>
        <div className="px-4 py-2">
          <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        </div>
      </div>
      <div className="flex flex-row space-x-4 items-start px-4 py-4">
        <div className="flex flex-col w-full h-full justify-start items-end">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>
        <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
          <OutputWindow outputDetails={outputDetails} />
          <div className="flex flex-col items-end">
            <button
              onClick={handleReview}
              disabled={!code}
              className={classnames(
                "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
                !code ? "opacity-50" : ""
              )}
            >
              {processing ? "Processing..." : "Review Code"}
            </button>
          </div>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Landing;