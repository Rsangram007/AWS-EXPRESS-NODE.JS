const express = require("express");
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require("uuid");
const routes = express.Router({
  mergeParams: true,
});

routes.get("/GetAll", async (req, res) => {
  const params = {
    TableName: "TodoTable",
  };

  try {
    const { Items } = await dynamoDb.scan(params).promise();
    console.log("Todos fetched:", Items);
    res.status(200).json(Items);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

routes.post("/", async (req, res) => {
  const { Todo } = req.body;
  const CreatedAt = new Date().toISOString();
  const id = uuidv4();
  const NewTodo = {
    id,
    Todo,
    CreatedAt,
    Completed: false,
  };

  const params = {
    TableName: "TodoTable",
    Item: NewTodo,
  };

  try {
    await dynamoDb.put(params).promise();
    console.log("Todo added:", NewTodo);
    res.status(200).json(NewTodo);
  } catch (error) {
    console.error("Error adding todo:", error);
    res.status(500).json({ error: "Failed to add todo" });
  }
});

routes.get("/Togetid/:TodoID", async (req, res) => {
  const { TodoID } = req.params;

  const params = {
    TableName: "TodoTable",
    Key: {
      id: TodoID,
    },
  };

  try {
    const { Item } = await dynamoDb.get(params).promise();

    if (Item) {
      console.log("Todo fetched:", Item);
      res.status(200).json(Item);
    } else {
      console.log("Todo not found");
      res.status(404).json({ error: "Todo not found" });
    }
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

routes.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { Completed } = req.body;

  const params = {
    TableName: "TodoTable",
    Key: {
      id,
    },
    UpdateExpression: "set Completed = :Completed",
    ExpressionAttributeValues: {
      ":Completed": Completed,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const { Attributes } = await dynamoDb.update(params).promise();

    if (Attributes) {
      console.log("Todo updated:", Attributes);
      res.status(200).json(Attributes);
    } else {
      console.log("Todo not found");
      res.status(404).json({ error: "Todo not found" });
    }
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete Todo by ID
routes.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: "TodoTable",
    Key: {
      id,
    },
    ReturnValues: "ALL_OLD",
  };

  try {
   const { Attributes }= await dynamoDb.delete(params).promise();
    console.log("Todo deleted:", id, Attributes);
    res
      .status(200)
      .json({ message: "Todo deleted successfully", data: Attributes });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});







module.exports = {
  routes,
};