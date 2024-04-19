import React from 'react'
// @ts-ignore
import styles from './Typing.module.scss'

const Typing = () => {
  return (
    <div className={styles.typing}>
    <div className={styles.typing__dot}></div>
    <div className={styles.typing__dot}></div>
    <div className={styles.typing__dot}></div>
  </div>
  )
}

export default Typing