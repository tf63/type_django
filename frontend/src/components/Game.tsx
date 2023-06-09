import React from 'react'
import { useEffect, useState, useRef, useContext } from 'react'
import { createContext } from 'react'
import Card from './Card'
import { useLocation } from 'react-router-dom'

const Caret: React.FC = () => <span className="caret"></span>

const TypeItem: React.FC<{ item: string; typed: Boolean; prefix: string }> = ({ item, typed, prefix }) => {
    const itemClass = typed ? 'typed' : 'untyped'

    return (
        <div>
            <span>{prefix}</span>
            <span className={itemClass}>{item.replace(/ /g, '\u00A0')}</span>
        </div>
    )
}

const TargetItem: React.FC<{ item: string; index: number; prefix: string }> = ({ item, index, prefix }) => (
    <div>
        <span>{prefix}</span>
        <span className="typed">{item.substring(0, index).replace(/ /g, '\u00A0')}</span>
        <Caret />
        <span className="untyped">{item.substring(index).replace(/ /g, '\u00A0')}</span>
    </div>
)

type TargetBlockState = {
    typeTexts: string[]
    index: number
    indexLine: number
}

const TargetBlock: React.FC<{ inputs: string[]; prefixs: string[] }> = ({ inputs, prefixs }) => {
    const [state, setState] = useState<TargetBlockState>({
        typeTexts: inputs,
        index: 0,
        indexLine: 0
    })

    const incrementGameState = useContext(GameStateContext)

    const divRef = useRef(null)

    useEffect(() => {
        if (divRef.current) {
            divRef.current.focus()
        }
    }, [])

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const key = event.key
        const text = state.typeTexts[state.indexLine]
        const index = state.index

        // ブラウザの動作があるキーを無効化する
        if (key == 'Tab' || key == ' ') {
            event.preventDefault()
            console.log('prevent default')
        }

        // 一部のキーはエスケープする
        if (key == 'Shift' || key == 'Control' || key == 'CapsLock' || key == 'Meta' || key == 'Alt') {
            console.log('disable key')
            return false
        }

        // 正誤判定
        if (index !== text.length) {
            // まだ行末に達していなかったら
            if (key == text[index]) {
                // 入力が合っていたら
                setState((prev) => ({ ...prev, index: prev.index + 1 }))
                incrementGameState.correct()
                console.log('correct !!')
            } else {
                // 入力が間違っていたら
                incrementGameState.miss()
                console.log('incorrect !!')
            }
        } else {
            // 行末に達していたら
            if (key === 'Enter') {
                // Enterが押されたら次の行へ移動
                setState((prev) => ({ ...prev, index: 0, indexLine: prev.indexLine + 1 }))
                incrementGameState.correct()
                console.log('correct !!')
            } else {
                // Enter以外のキーが押されたらミスとする
                incrementGameState.miss()
                console.log('incorrect !!')
            }
        }

        console.log(key, state.index)
    }

    const targetItems = []
    for (const [i, typeText] of state.typeTexts.entries()) {
        let item
        if (i < state.indexLine) {
            item = <TypeItem item={typeText} typed={true} prefix={prefixs[i]} />
        } else if (i == state.indexLine) {
            item = <TargetItem index={state.index} item={typeText} prefix={prefixs[i]} />
        } else {
            item = <TypeItem item={typeText} typed={false} prefix={prefixs[i]} />
        }

        targetItems.push(
            <li key={i} className="target_item">
                {item}
            </li>
        )
    }

    return (
        <div className="card target_block" tabIndex={0} onKeyDown={handleKeyDown} ref={divRef}>
            <ul>{targetItems}</ul>
        </div>
    )
}

type GameState = {
    correct: number
    miss: number
    time: number
}

interface IncrementGameState {
    correct: () => void
    miss: () => void
    time: () => void
}

const GameStateContext = createContext<IncrementGameState>({ correct: () => {}, miss: () => {}, time: () => {} })

// リファクタリングが必要
const Game: React.FC = () => {
    const location = useLocation()
    const [typeTexts, setTypeTexts] = useState<string[]>([])
    const [prefixs, setPrefixs] = useState<string[]>([])

    const [gameState, setGameState] = useState<GameState>({
        correct: 0,
        miss: 0,
        time: 0
    })

    const incrementCorrect = () => {
        setGameState((prev) => ({ ...prev, correct: prev.correct + 1 }))
    }
    const incrementMiss = () => {
        setGameState((prev) => ({ ...prev, miss: prev.miss + 1 }))
    }
    const incrementTime = () => {
        setGameState((prev) => ({ ...prev, time: prev.time + 1 }))
    }

    const incrementGameState: IncrementGameState = {
        correct: incrementCorrect,
        miss: incrementMiss,
        time: incrementTime
    }

    useEffect(() => {
        // inputs
        setTypeTexts(location.state.words)

        const tabCounts: number[] = location.state.tab_counts
        const tabSpaceWidth = 4
        const spaces = tabCounts.map((tabCount) => {
            return '\u00A0'.repeat(tabSpaceWidth).repeat(tabCount)
        })
        setPrefixs(spaces)

        const interval = setInterval(() => {
            incrementGameState.time()
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    // useEffect(() => {
    //     console.log(typeTexts)
    // }, [typeTexts])

    if (typeTexts.length == 0) {
        console.log('Loading...')
        return <div>Loading...</div>
    }

    return (
        <GameStateContext.Provider value={incrementGameState}>
            <Card content="Game" />
            <TargetBlock inputs={typeTexts} prefixs={prefixs} />
            <Card content={`correct: ${gameState.correct}`} />
            <Card content={`miss: ${gameState.miss}`} />
            <Card content={`time: ${gameState.time}`} />
        </GameStateContext.Provider>
    )
}

export default Game
