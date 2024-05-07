const server = require("http").createServer();
const express = require("express");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const OpenAI = require("openai");
const { type } = require("os");
const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// ***************************************************** open ai
const openai = new OpenAI();

async function openAiVisionUpcycle({ image64 }) {
  let schema = JSON.stringify({
    objectDescription: "describe the objects in the image",
    list: [
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
      {
        number: 5,
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
       Output in JSON using the schema defined here: ${schema}
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
              url: `data:image/jpeg;base64,${image64}`,
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
}
async function openAiImages({ prompt }) {
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt,
  });

  console.log(image.data);
}

// ********************************************* app/http
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/add-to-cart", (req, res) => {
  const { productId } = req.body;
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const uuid = uuidv4(); // Generate a unique ID
  responses[uuid] = res; // Map the response object to the ID

  // Send a message to the AI client
  if (clients.AI) {
    clients.AI.send(
      JSON.stringify({ type: "add-to-cart", uuid: uuid, productId: productId })
    );
  } else {
    res.status(500).send({ error: "AI client not connected" });
  }
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
});

server.on("request", app);

server.listen(PORT, () => {
  console.log(`server is now listening on localhost:${PORT}`);
});
