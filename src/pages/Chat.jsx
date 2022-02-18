import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const User = (props) => {
  const { user, onClick } = props;

  return (
    <div onClick={() => onClick(user.name)} className="displayName">
      <div className="displayPic">
        <img
          src="https://i.pinimg.com/originals/be/ac/96/beac96b8e13d2198fd4bb1d5ef56cdcf.jpg"
          alt=""
        />
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
          margin: "0 10px",
        }}
      >
        <span style={{ fontWeight: 500 }}>{user.name}</span>
        <span
          className={user.isOnline ? `onlineStatus` : `onlineStatus off`}
        ></span>
      </div>
    </div>
  );
};

const Chat = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser?.displayName;
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatStarted, setChatStarted] = useState(false);
  const [chatUser, setChatUser] = useState("");
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [userUid, setUserUid] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get reference
        const usersRef = collection(db, "users");

        // Create a query
        const q = query(usersRef, orderBy("name", "asc"));

        // Execute query
        const querySnap = await getDocs(q);

        const users = [];

        querySnap.forEach((doc) => {
          if (doc.data().name !== currentUser) {
            return users.push(doc.data());
          }
        });

        setUsers(users);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch your chat users");
      }
    };

    fetchUsers();
  }, [currentUser]);

  const getConversations = async (user) => {
    const convRef = collection(db, "conversations");

    const q = query(convRef, where("from", "in", [currentUser, user]));

    const querySnap = await getDocs(q);

    const conversations = [];

    querySnap.forEach((doc) => {
      if (
        (doc.data().from === currentUser && doc.data().to === user) ||
        (doc.data().from === user && doc.data().to === currentUser)
      ) {
        conversations.push(doc.data());
      }
    });

    setConversations(conversations);
  };

  const initChat = async (user) => {
    setChatStarted(true);
    setChatUser(`${user}`);
    setUserUid(user);
    getConversations(user);
  };

  const submitMessage = async (e) => {
    setLoading(true);
    const msgObj = {
      from: currentUser,
      to: userUid,
      message,
      timestamp: serverTimestamp(),
    };

    if (message !== "") {
      const convRef = await addDoc(collection(db, "conversations"), msgObj);
      console.log("ref", convRef);

      toast.success("Message sent");
      getConversations(userUid);
    }
    setLoading(false);
    setMessage("");
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <section className="container">
      <div className="listOfUsers">
        {users.length > 0
          ? users.map((user, index) => {
              return (
                <User
                  onClick={initChat}
                  key={`user-container-${index + 1}`}
                  user={user}
                />
              );
            })
          : null}
      </div>

      <div className="chatArea">
        <div className="chatHeader">{chatStarted ? chatUser : ""}</div>
        <div className="messageSections">
          {chatStarted
            ? conversations.map((con, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: con.from === currentUser ? "right" : "left",
                  }}
                >
                  <p className="messageStyle">{con.message}</p>
                </div>
              ))
            : null}
        </div>
        {chatStarted ? (
          <div className="chatControls">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write Message"
            />
            <button onClick={submitMessage}>Send</button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Chat;
