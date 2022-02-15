import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const User = (props) => {
  const { user, onClick } = props;

  return (
    <div onClick={() => onClick(user)} className="displayName">
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
        <span style={{ fontWeight: 500 }}>
          {user.firstName} {user.lastName}
        </span>
        <span
          className={user.isOnline ? `onlineStatus` : `onlineStatus off`}
        ></span>
      </div>
    </div>
  );
};

const Chat = () => {
  const auth = getAuth();
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
        const listingsRef = collection(db, "users");

        // Create a query
        const q = query(listingsRef, orderBy("timestamp", "desc"));

        // Execute query
        const querySnap = await getDocs(q);

        const users = [];

        querySnap.forEach((doc) => {
          return users.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setUsers(users);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    };

    fetchUsers();
  }, []);

  const initChat = (user) => {
    setChatStarted(true);
    setChatUser(`${user.firstName} ${user.lastName}`);
    setUserUid(user.uid);

    db.collection("conversations")
      .where("user_uid_1", "in", [user.uid_1, user.uid_2])
      .orderBy("createdAt", "asc")
      .onSnapshot((querySnapshot) => {
        const conversations = [];

        querySnapshot.forEach((doc) => {
          if (
            (doc.data().user_uid_1 === user.uid_1 &&
              doc.data().user_uid_2 === user.uid_2) ||
            (doc.data().user_uid_1 === user.uid_2 &&
              doc.data().user_uid_2 === user.uid_1)
          ) {
            conversations.push(doc.data());
          }

          setConversations(conversations);
        });
      });
  };

  const submitMessage = (e) => {
    const msgObj = {
      user_uid_1: auth.uid,
      user_uid_2: userUid,
      message,
    };

    if (message !== "") {
      db.collection("conversations").add({
        ...msgObj,
        isView: false,
        createdAt: new Date(),
      });
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <section className="container">
      <div className="listOfUsers">
        {users.length > 0
          ? users.map((user) => {
              return <User onClick={initChat} key={user.uid} user={user} />;
            })
          : null}
      </div>

      <div className="chatArea">
        <div className="chatHeader">{chatStarted ? chatUser : ""}</div>
        <div className="messageSections">
          {chatStarted
            ? conversations.map((con) => (
                <div
                  style={{
                    textAlign: con.user_uid_1 === auth.uid ? "right" : "left",
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
