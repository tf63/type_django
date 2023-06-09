function setCaret(sentence, index, index_line) {
    let pressed = sentence.substring(0, index);
    pressed = pressed.replace(/ /g, "&nbsp;")

    $(`#target_pressed${index_line}`).html(pressed);
    $(`#target_text${index_line}`).html(
        "<span class='caret'></span>" + sentence.substring(index)
    );
}

function setTimer(timeLeft) {
    // タイマー表示
    $('#time_left').text(timeLeft);
    let intervalId = setInterval(function () {
        timeLeft--;
        $('#time_left').text(timeLeft);
        if (timeLeft === 0) {
            clearInterval(intervalId);
            // $('#submit_button').prop('disabled', true);
        }
    }, 1000);
}

// HTMLがロードされたら
$(document).ready(async function () {

    // api
    const response = await $.ajax({
        url: '/api/code/',
    });

    // inputs
    let word = response.word;
    let words = response.words;
    let num_lines = words.length;
    let tab_counts = response.tab_counts;
    let timeLeft = response.time_limit;
    setTimer(timeLeft);

    // settings
    let tab_space_width = 4;

    // test
    console.log(`words length: ${words.length}, tab_counts: length: ${tab_counts.length}`)

    // variables
    let index = 0;
    let index_line = 0;
    let incorrect = 0;
    let sentence = words[index_line];

    // set indent
    for (let i = 0; i < num_lines; i++) {
        let space = '&nbsp;'.repeat(tab_space_width).repeat(tab_counts[i]);
        let space_prefix = `<span>${space}</span>`
        let pressed_prefix = `<span id='target_pressed${i}' class='pressed'></span>`
        let new_item = $("<li>").attr("class", "target_item");
        new_item.html(space_prefix + pressed_prefix + `<span id='target_text${i}'>` + words[i] + "</span>");
        $('#target_list').append(new_item);
    }

    setCaret(sentence, index, index_line);

    // catch keydown
    $(document).on("keydown", function (event) {

        let key = event.key;
        console.log(`キー ${key} が押されました`);

        // ブラウザの動作があるキーを無効化する
        if (key == "Tab" || key == " ") {
            event.preventDefault();
            console.log("prevent default");
        }

        // 一部のキーはエスケープする
        if (key == "Shift" || key == "Control" || key == "CapsLock" || key == "Meta" || key == "Alt") {
            return false;
        }

        // shiftキーが押されている場合、文字列を大文字に変換する
        if (event.shiftKey) {
            key = key.toUpperCase();
        }

        // 正誤判定
        // ----------------------------------------------------------------
        if (index != sentence.length) {
            // まだ行末に達していなかったら

            if (key == sentence.charAt(index)) {
                // 入力が合っていたら
                index++;
                setCaret(sentence, index, index_line);

                $('#result').text('Correct!');
                $('#correct').text(index);
            } else {
                // 入力が間違っていたら
                incorrect++;
                $('#result').text('Incorrect...');
                $('#incorrect').text(incorrect);
            }

            if (index == sentence.length && index_line == num_lines - 1) {
                console.log("complete !");
                window.location.href = '/result/';
            }
        } else {
            // 行末に達していたら

            if (key == "Enter") {
                // Enterが押されたら次の行へ移動
                $(`#target_text${index_line}`).html("");
                index_line++;
                $('#result').text('complete line');

                // sentenceを初期化
                sentence = words[index_line];
                index = 0;
                setCaret(sentence, index, index_line);
            } else {
                // Enter以外のキーが押されたらミスとする
                incorrect++;
                $('#result').text('Incorrect...');
                $('#incorrect').text(incorrect);
            }
        }
    })
});