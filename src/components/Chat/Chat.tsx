import { useState, useEffect, useRef } from 'react';
import { Button, Form, Input, Tooltip } from 'antd'
import ScrollToBottom from 'react-scroll-to-bottom'
//axios
import axios from 'axios'
//icons 
import { IoMdSend } from "react-icons/io";
//react-hot-toast
import toast from 'react-hot-toast';
// @ts-ignore
import styles from './Chat.module.scss'
import classname from 'classnames/bind'

import Filter from 'bad-words';
import Typing from '../Typing';

interface ChatProps {
  socket:any
  username: string
  room: string
}
type MessageType = {
  room: string
  author: string 
  message:string 
  time: string
}

const checkText = (text:string) => {
  const filter = new Filter();
  const isToxic = filter.isProfane(text);
  return isToxic;
}
const cn = classname.bind(styles)
const Chat = (props: ChatProps) => {
  const {
    socket, 
    username, 
    room
  } = props

  const inputRef:any = useRef(null)

  const [message, setMessage] = useState<string>('')
  const [messageList, setMessageList] = useState<MessageType[]>([])
  const [isToxic, setIsToxic] = useState<boolean>(false)
  const [typing, setTyping] = useState<boolean>(false)
  const [showTypingI, setShowTypingI] = useState<boolean>(false)

  const key = 'AIzaSyDOFxeZJumPOKHQwEg_7Nq8opDmoIKrKhI'
  const postUrl = 
  `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`


  const sendMessage = async () => {
    if(message !== ""){
      const data = {
        room, author: username, 
        message, time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
      }

      const response = await axios.post(postUrl, {
        comment: {
          text: message, 
        }, 
        languages: ["en", "ru"],
        requestedAttributes: {
          TOXICITY: {},
          INSULT: {},
          // FLIRTATION: {},
          THREAT: {}
        }
      })

      const intents = response.data.attributeScores;
      let _isToxic = false
      console.log('intents', intents)
      Object.keys(intents).forEach(key => {
        const probability = intents[key].summaryScore.value;
        if (probability >= 0.49) {
          _isToxic = true
        }
      });
      console.log(!_isToxic ? "Good to go!" : "Clean it up!");

      if(_isToxic){
        setIsToxic(_isToxic)
        toast.error('Message contains toxicity')
      }else {
        socket.emit('send', data)
        setMessageList(prev => [...prev, data])
        setMessage('')
        //remove typing 
        if(inputRef.current)
          inputRef.current.blur();
      }
    }
  }


  useEffect(() => {
    const receive = (message: MessageType) => {
      setMessageList(prev => [...prev, message])
    }
    const getStatus = (data: any) => {
      console.log('new data', data)
      if(data.author !== username && data.room === room && data.status)
        setShowTypingI(true)
      else setShowTypingI(false)
    }

    socket.on('receive', receive)
    socket.on('status', getStatus)
    return () => {
      socket.off('receive', receive)
      socket.off('status', getStatus)

    }
  }, [socket])

  useEffect(() => {
    if(isToxic)
      setIsToxic(false)
  }, [message])

  useEffect(() => {
    if(socket){
      const data = {
        author: username, 
        status: typing, 
        room, 
      }
      socket.emit('typing', data)
    }
  }, [typing])


  return (
    <div className={styles.container}>
      <div className={styles.chatHeader}>
        <p>Live chat</p>
        {
          showTypingI && <div className={styles.loading}><Typing /></div>
        }
      </div>

      <div className={styles.chatBody}>
        <ScrollToBottom className={styles.bodyHeight}>
        {
          messageList && messageList.map((message, i) => (
           <div className={cn({
              message: true, 
              me: username === message.author, 
              other: username !== message.author
           })} key={i}>
              <div className={cn({
                content: true, 
                meContentBg: username === message.author
              })}>
                <p>{message.message}</p>
              </div>
              <div className={styles.meta}>
                <span>{message.time}</span>
                <span>{message.author}</span>
              </div>
           </div>
          ))
        }
        </ScrollToBottom>
      </div>
      <Form onSubmitCapture={sendMessage} className={styles.chatFooter}>
        <Input
            type='text' 
            ref={inputRef}
            onChange={e => setMessage(e.target.value)}
            value={message}
            status={isToxic && message !== '' ? 'error' : ''}
            onFocus={() => setTyping(true)}
            onBlur={() => setTyping(false)}
        /> 
        <Tooltip title='Send'>
          <Button size='large' htmlType='submit' shape='circle' type="primary"  icon={<IoMdSend />}/>
        </Tooltip>
      </Form>


    </div>
  )
}

export default Chat