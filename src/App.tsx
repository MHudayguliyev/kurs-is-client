import { useState } from 'react';
import { io } from 'socket.io-client';
import { Button, Input, Form } from 'antd';
//styles
// @ts-ignore
import styles from './app.module.scss'
import Chat from './components/Chat/Chat';
// for notification
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast'

const socket = io('http://localhost:8080')

function App() {
  const [username, setUsername] = useState<string>("")
  const [room, setRoom] = useState<string>("")
  const [showChatForm, setShowChatForm] = useState<boolean>(false)
  const [joining, setJoining] = useState<boolean>(false)

  const onSubmit = () => {
    if(username !== "" && room !== ""){
      setJoining(true)
      socket.emit('join-room', room)
      setTimeout(() => {
        setJoining(false)
        setShowChatForm(true)
      }, 1000)
    }else toast.error('Please enter credentials.')
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      <div className={styles.container}>
        {
          !showChatForm ? 
            <Form onSubmitCapture={onSubmit} className={styles.theForm}>

              <div>Join the chat</div>
              <p>Please enter the credentials to join</p>
              <Input 
                placeholder="username" 
                className={styles.field} 
                onChange={e => setUsername(e.target.value)} 
                value={username}
                // status="error"
              />
              <Input 
                placeholder="room" 
                className={styles.field} 
                onChange={e => setRoom(e.target.value)} 
                value={room}
              />
              <Button htmlType='submit' type="primary" block loading={joining}>
                Submit
              </Button>
            </Form> : 

            <Chat 
              socket={socket}
              username={username}
              room={room}
            />
        }
      </div>
    </>
  )
}

export default App
