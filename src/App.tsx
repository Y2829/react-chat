import { useState, useEffect } from "react";
import { io } from "socket.io-client";

import { styled } from "@mui/system";
import { Box, Button, TextField } from "@mui/material";

type Message = {
  type: "info" | "received" | "send";
  data: string;
};

const socket = io("http://localhost:8080");

function createUserId() {
  const random = Math.round(Math.random() * 1000000);
  return random;
}

function App() {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [messageList, setMessageList] = useState<Array<Message>>([]);

  const handleChangeMessage = (newValue: string) => {
    setMessage(newValue);
  };

  const handleChangeUserName = (newValue: string) => {
    setUserName(newValue);
  };

  const handleClickSubmitMessage = () => {
    socket.emit("chat", { from: { name: userName }, msg: message });
    setMessageList((prev) => [...prev, { type: "send", data: message }]);
  };

  const handleClickEnterBtn = () => {
    const userId = createUserId();
    setUserId(userId);
    setUserName(`${userName} ${userId}`);
    socket.emit("login", {
      name: `${userName} ${userId}`,
      userId,
    });

    setIsLogged(true);
  };

  useEffect(() => {
    socket.on("login", (data) => {
      setMessageList((prev) => [
        ...prev,
        { type: "info", data: `${data}님이 입장하셨습니다.` },
      ]);
    });

    socket.on("chat", (data) => {
      console.log("chat", data);
      setMessageList((prev) => [...prev, { type: "received", data: data.msg }]);
    });
  }, []);

  console.log(new Set(messageList));
  return (
    <Container>
      <Box>
        <TextField
          value={userName}
          onChange={(e) => handleChangeUserName(e.target.value)}
        />
        <Button onClick={handleClickEnterBtn}>입장</Button>
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messageList.map((message, index) => {
          switch (message.type) {
            case "received":
              return (
                <ReceivedMessage key={index}>{message.data}</ReceivedMessage>
              );
            case "send":
              return <SendMessage key={index}>{message.data}</SendMessage>;
            default:
              return <InfoMessage key={index}>{message.data}</InfoMessage>;
          }
        })}
      </Box>
      <Box>
        <TextField
          value={message}
          onChange={(e) => handleChangeMessage(e.target.value)}
        />
        <Button onClick={handleClickSubmitMessage}>전송</Button>
      </Box>
    </Container>
  );
}

export default App;

const Container = styled(Box)({});

const ReceivedMessage = styled(Box)({
  width: "250px",
  padding: "16px",
  border: "1px solid #0f0f0f",
  borderRadius: "16px",
  alignSelf: "start",
});

const SendMessage = styled(Box)({
  width: "250px",
  padding: "16px",
  border: "1px solid #0f0f0f",
  borderRadius: "16px",
  backgroundColor: "skyblue",
  alignSelf: "flex-end",
});

const InfoMessage = styled(Box)({
  width: "100%",
  display: "flex",
  justifyContent: "center",
});
