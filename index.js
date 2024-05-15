const server = require("http").createServer();
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const OpenAI = require("openai");
const dotenv = require("dotenv").config();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// ***************************************************** open ai
const openai = new OpenAI();

async function openAiVisionUpcycle({ image64 }) {
  let schema = JSON.stringify({
    status:
      "true or false, true if the object can be upcycled, false if it cant be upcycled",
    objectDescription: "describe the objects in the image",
    list: [
      {
        number: 0,
        title: "a short title that describes the idea",
        ideaDescription:
          "describe the idea, what will be the new way to use this object, how to upcycle it",
        imageDescription:
          "describe how the new upcycled object should look like",
      },
      {
        number: 1,
        title: "a short title that describes the idea",
        ideaDescription:
          "describe the idea, what will be the new way to use this object, how to upcycle it",
        imageDescription:
          "describe how the new upcycled object should look like",
      },
      {
        number: 2,
        title: "a short title that describes the idea",
        ideaDescription:
          "describe the idea, what will be the new way to use this object, how to upcycle it",
        imageDescription:
          "describe how the new upcycled object should look like",
      },
      {
        number: 3,
        title: "a short title that describes the idea",
        ideaDescription:
          "describe the idea, what will be the new way to use this object, how to upcycle it",
        imageDescription:
          "describe how the new upcycled object should look like",
      },
      {
        number: 4,
        title: "a short title that describes the idea",
        ideaDescription:
          "describe the idea, what will be the new way to use this object, how to upcycle it",
        imageDescription:
          "describe how the new upcycled object should look like",
      },
    ],
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: `
      you are a helpful AI assistant.
      you will get an image of an object or a few objects, 
      return a list of 5 ideas to upcycle
       the objects in the image, 
       the objects will be thrown in the trash so the idea is to find a new use for it instead if throwing it into the trash,  
       for reach idea return the idea suggestion and an image description 
       of the idea and how it should look like, 
       Output in JSON using the schema defined here: ${schema},
       in case the image is not of an object that can be upcycled return in the following schema: 
       {status:
        "true or false, true if the object can be upcycled, false if it cant be upcycled",
      objectDescription: "describe the objects in the image",
      "reason":"the reason that the image cant be upcycled"
    }
       `,
          },
        ],
      },
      {
        role: "user",
        content: [
          { type: "text", text: "the image to generate ideas for" },
          {
            type: "image_url",
            image_url: {
              url: image64,
            },
          },
        ],
      },
    ],
  });
  return JSON.parse(response.choices[0].message.content);
}
async function openAiEcho_sort({ image64 }) {
  let schema = JSON.stringify({
    material:
      "the material that the object is most likely made of, (metal or plastic)",
  });
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: `
      you are a helpful AI assistant.
      you will get an image of an object, 
      return if the object is made of plastic or metal,
      return in a json format and use this schema: ${schema}
       `,
          },
        ],
      },
      {
        role: "user",
        content: [
          { type: "text", text: "the image to analyze the material for" },
          {
            type: "image_url",
            image_url: {
              url: image64,
            },
          },
        ],
      },
    ],
  });
  return JSON.parse(response.choices[0].message.content);
}

async function openAiImage(imageDescription) {
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: imageDescription,
  });
  return image.data;
}

async function openAIImageAll(list) {
  let promises = [];
  let newList = [...list];
  list.forEach((element) => {
    promises.push(
      openAiImage(element.imageDescription).then((data) => {
        newList[element.number]["imageData"] = data;
      })
    );
  });
  await Promise.all(promises);
  return newList;
}

// ********************************************* app/http
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let images64 = {};

app.post("/new_image", (req, res) => {
  try {
    const { image64 } = req.body;
    const id = uuidv4();
    images64[id] = image64;
    res.send({ imageID: id });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});

app.post("/upcycle_for_image", async (req, res) => {
  const { imageID } = req.body;
  console.log(imageID);
  const image64 = images64[imageID];
  openAiVisionUpcycle({ image64 }).then(async (aiResponse) => {
    openAIImageAll(aiResponse.list).then((list) => {
      aiResponse.list = list;
      delete images64[imageID];
      res.send({ aiResponse });
    });
  });
});

app.post("/eco_sort", async (req, res) => {
  const { image64 } = req.body;
  openAiEcho_sort({ image64 }).then((aiResponse) => {
    res.send({ aiResponse });
  });
});

server.on("request", app);

server.listen(PORT, () => {
  console.log(`server is now listening on localhost:${PORT}`);
});
