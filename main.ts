import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const users = [];
const SECRET_KEY = "your_secret_key";

interface Request {
  numReq: number;
  dateOfAdd: Date;
  organziation: string;
  Model: string;
  Description: string;
  Fio: string;
  NumberPhone: string;
  Status: string;
  Master: string;
  Problem: string;
}

const request1 = {
  numReq: 1,
  dateOfAdd: new Date(),
  organziation: "ООО 'Рога и Копыта'",
  Model: "Самолет",
  Description: "Нужен для перевозки груза",
  Fio: "Иванов Иван Иванович",
  NumberPhone: "+79123456789",
  Status: "Выполнено",
  Master: "Иванов Иван Иванович",
  Problem: "Проблема с двигателем",
};

const requests: Request[] = [];
requests.push(request1);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { username, password: hashedPassword };
  users.push(user);
  res.status(201).send("Пользователь создан");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).send("Неправильное имя пользователя или пароль");
    return;
  }
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.send({ token });
});
app.post("/requests", (req, res) => {
  const newRequest: Request = req.body;
  newRequest.dateOfAdd = new Date();
  requests.push(newRequest);
});

app.get("/", (req, res) => {
  res.send(requests);
});

app.get("/requests/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const request = requests.find((request) => request.numReq === id);
  if (!request) {
    res.status(404).send("Заявка не найдена");
    return;
  }
  res.send(request);
});
app.put("/requestss/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const updatedRequest: Request = req.body;
  const index = requests.findIndex((request) => request.numReq === id);
  if (index === -1) {
    res.status(404).send("Заявка не найдена");
    return;
  }
  requests[index] = updatedRequest;
  res.send(updatedRequest);
});

app.get("/statistics", (req, res) => {
  const doneRequests = requests.filter(
    (request) => request.Status === "Выполнено"
  ).length;
  res.send({ doneRequests });
});

app.listen(port, () => {
  console.log("запущен на http://localhost:3000");
});
