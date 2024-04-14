/*
コンポジションの尺を変更するスクリプトです。
アニメ向けに作っているのでボールドの尺が選べるようになっています。

上部のみを表示すれば手動で尺を打てて下部まで表示すればマウスのみで数字が打てる仕様です。
もともとコンテ撮を最速でやるために作ったスクリプトなのでこんな仕様になっています。

*/



//Preferenceを構成する
//************************************************************************************

//環境設定用のテキスト
function calculatorlog(){
    str =
    "Xsize=70\r"+
    "Ysize=35\r"+
    "RenameCompItem=true\r"+
    "TimeBoldselect=2\r"+
    "Folderlusive=CG:04 etc\r"+
    "TimeAjastAll=true\r"+
    "TimeAjastSingle=false\r"+
    "CutNumberSwitch=false\r"+
    "CutNumberAdd=10_composite:20_camerawork:30_DF:01_main:02_fr:03_画面調整\r"+
    "preset00=00+00\r"+
    "preset01=00+12\r"+
    "preset02=01+12\r"+
    "preset03=02+12\r"+
    "preset04=03+12\r"+
    "preset05=04+12\r"+
    "preset06=05+12\r"+
    "preset07=06+12\r"+
    "preset08=07+12\r"+
    "preset09=08+12\r"+
    "preset10=09+12\r"+
    "preset11=10+12"
    return str
}

//環境設定を作成する
function userPreference() {

    //使用環境に合わせてここは書き換えてください
    userName = $.getenv("USERNAME");
    preftoolsPath = "C:/Users/" + userName + "/Documents/anytools";
    prefFolder = new Folder(preftoolsPath);

    // フォルダが存在しなければ作成する
    if (!prefFolder.exists) {
        prefFolder.create();
    }

    // スクリプトのファイル名を取得し、拡張子を除去する
    thisScriptName = File($.fileName).name.replace(".jsx", "").toLowerCase();

    // 設定ファイルのパスを指定
    calculatorLogPath = preftoolsPath + "/" + thisScriptName + "setting.txt";
    calculatorLog = new File(calculatorLogPath);

    // 設定ファイルが存在しない場合は初期化
    if (!calculatorLog.exists) {
        initSettings(calculatorLog);
    }

    //環境設定のファイルパスを戻り地として返す
    return calculatorLogPath;
}


//環境設定をグローバス変数に追加する
function loadsettings(){

    //連想配列登録用のKey
    profile = [
        "Xsize","Ysize","TimeBoldselect",
        "Folderlusive","TimeAjastAll","TimeAjastSingle",
        "CutNumberSwitch","CutNumberAdd","RenameCompItem",
        "preset00","preset01","preset02",
        "preset03","preset04","preset05",
        "preset06","preset07","preset08",
        "preset09","preset10","preset11"
    ]

    // ユーザー設定ファイルのパスを取得
    var settingsPath = userPreference(); 
    var fileObj = new File(settingsPath);
    appsettings = {};//配列の中身を初期化する
    appsettings["preferencetxtpath"] = settingsPath//環境設定のパスだけ手動で追加

    if (fileObj.open("r")) {
        while (!fileObj.eof) {
            var txt = fileObj.readln();
            //$.writeln(txt)
            for (var i = 0; i < profile.length; i++) {
                var key = profile[i];
                // txtがキーにマッチするかどうかをチェック
                if (txt.indexOf(key + "=") === 0) {
                    // キーに対応する値を抽出してappsettingsに格納
                    appsettings[key] = txt.split("=")[1];
                    break; // マッチしたら他のキーとのマッチングを中止
                }
            }
        }
        fileObj.close();
    }

}


// 設定の初期化または更新に使用する関数
function initSettings(calculatorLog) {
    // 設定を初期化するコードをここに記述
    var aelog = calculatorlog(); // この関数はaelogの内容を返すと仮定
    calculatorLog.open("w");
    calculatorLog.write(aelog);
    calculatorLog.close();
}



//環境設定を書き換える
function calculatorReplace(variable, variableWriting , calculatorpath) {
    var fileObj = new File(calculatorpath);
    var output = [];

    if (fileObj.open("r")) {
        while (!fileObj.eof) {
            var txt = fileObj.readln();
            if (txt.match(new RegExp(variable + "(\\d{2})?="))) {
                txt = variable + "=" + File.decode(variableWriting);
            }
            output.push(txt);
        }
        fileObj.close();
        
        if (fileObj.open("w")) {
            for (var i = 0; i < output.length; i++) {
                fileObj.writeln(output[i]);
            }
            fileObj.close();
            loadsettings()//環境設定を初期化する
        }
    }
}


//********************************************************************************





//UIを構成する
//********************************************************************************

// UIコンポーネント
function uiFactory(type, parent, properties) {
    // 要素を作成。dropdownlist の場合は、初期アイテムは空で作成
    var element = parent.add(type, undefined, type === 'dropdownlist' ? undefined : properties.text);

    for (var property in properties) {
        if (!properties.hasOwnProperty(property)) continue; // プロパティがオブジェクト自身のものでなければスキップ

        //イベントごとに特定の操作になるように分岐
        if (property === 'onClick' && typeof properties[property] === 'function') {
            // onClickイベントを設定
            element.onClick = properties[property];
        }else if(property === 'onChange' && typeof properties[property] === 'function') {
            element.onChange = properties[property];
        }else if (property === 'items' && type === 'dropdownlist') {
            // dropdownlist にアイテムを追加
            for (var i = 0; i < properties.items.length; i++) {
                element.add('item', properties.items[i]);
            }
        } else if (property !== 'text') {
            // その他のプロパティを設定（'text' は除外）
            element[property] = properties[property];
        }
    }
    
    // ドロップダウンリストのデフォルト選択項目を設定
    if (type === 'dropdownlist' && properties.hasOwnProperty('selection')) {
        element.selection = properties.selection;
    }

    return element;
}


//クリックされたときに入力する機構
function textValueSwitch (secNmber,chage_textbox,uiComponents){

    switch (secNmber){

        case "↩" : 
            //一文字づつ消す
            chage_textbox.text = String(chage_textbox.text).slice(0,-1);
            break;

        case "OK" :
            //尺を変更する
            Composion_TimeEdit(uiComponents)
            break;

        default: 
            chage_textbox.text = String(chage_textbox.text)+String(secNmber)

    }

}

//クリックの判定をする
function updateTextFields(event,secNmber,uiComponents){

    //どちらをクリックしているかを定義
    LEFT_CLICK = 0;
    RIGHT_CLICK = 2;

    //右クリックか左クリックかで該当の値を取得する
    targetTxtbot = event.button === LEFT_CLICK ? uiComponents["secTextbox"] : uiComponents["komaTextbox"]
    textValueSwitch (secNmber,targetTxtbot,uiComponents);

}

// 数字ボタンと機能ボタンを生成する
function createKeypad(parent,uiComponents) {
    var keypadLayout = [
        ["7", "8", "9"],
        ["4", "5", "6"],
        ["1", "2", "3"],
        ["0", "↩", "OK"] // 最後の行に0と特殊機能ボタンを配置
    ];

    //ボタンを配置する部分
    for(i = 0 ;i < keypadLayout.length;i++){
        //先にグループを行数分作る
        row = keypadLayout[i]
        group = uiFactory("group", parent, {orientation:"row",alignment:["fill", "fill"],spacing:5})
        //中身を割り当てていく
        for(j=0;j<row.length;j++){
            // 即時関数で number パラメータをキャプチャ
            (function(number) { 
                var mybutton = uiFactory("button", group, {text: number});
                    mybutton.addEventListener('mousedown', function(event) {
                        // ここで updateTextFields を呼び出す場合も number を使用
                        updateTextFields(event, number,uiComponents);
                    });
            })(row[j]);
        }
    }

}


//選んでるボールドを取得する
function SelectBold_list(boldtiming){
    return Number(String(boldtiming["boldDropdown"].selection).split(":")[1])
}


//レンダーコンポをリネーム
function compositionRename(tragetCompItem){
    beforeName = tragetCompItem.name;
    afterName = String(app.project.file.name).replace("\.aep","");
    tragetCompItem.name = afterName
    app.project.autoFixExpressions(beforeName,afterName);
}

//尺変更が動く
function apply_Compsion_TimeEdit(uiComponents,Selectedbold,Animation_Fps){

    //戻る用の設定
    app.beginUndoGroup("calculator");

    //尺を変更する
    flag = Update_TimeEdit(uiComponents,Selectedbold,Animation_Fps)

    if(flag !== null){    
        //変わったことのアラート
        alert("尺を"+sec+"+"+koma+"に変更しました")
    }

    app.endUndoGroup();
    
}


//フッテージのIDからアイテムの番号を取得する
function getID(testtype){
    for(SS=1;SS<=app.project.items.length;SS++){
        if(app.project.items[SS].id == testtype){
            return SS ;
        }
    }
}

//コンポを指定して尺を変えたいときに使う
function selectComp_Timeedit() {
    var activeItem = app.project.activeItem;
    if (!activeItem || !(activeItem instanceof CompItem)) {
        alert("適用したいコンポを選んでください");
        return null;
    }
    return activeItem;
}

//各コンポジションの尺を変更する
function editcompDuration(Compitem,EXduration){
        Compitem.duration = EXduration
}

//コンポの尺を実際に書き換える
function Update_TimeEdit(uiComponents,bold,fps){

    sec =  Number(uiComponents["secTextbox"].text)
    koma = Number(uiComponents["komaTextbox"].text)
    defaultduration = (sec * fps + koma) / fps;//ボールドなしの尺
    EXduration = (sec * fps + koma + bold) / fps;//ボールドありの尺
    items = app.project.items;

    //ボールドを適用するやつの分岐
    if(appsettings["TimeAjastSingle"] == "true"){
        if(selectComp_Timeedit()  !== null){
            targetComp = getID(selectComp_Timeedit().id)
        }else{
            return null
        }
    }else{
        //一個以上あるかで分岐させる
        targetComp = items.length >= 2  ? 2 : 1
    }
    
    //すべてのコンポジションの尺を変更する
    for (var i = 1; i <= items.length; i++) {
        var item = items[i];
        if (item instanceof CompItem) {
            // ボールドを含む尺か含まないかの分岐
            if (item === items[targetComp]) { 
                editcompDuration(item, EXduration);
                //リネームが有効かを判断
                if(appsettings["RenameCompItem"] == "true" && !(app.project.file == null)){
                    compositionRename(item)
                }
            } else if(appsettings["TimeAjastAll"] == "true"){
                editcompDuration(item, defaultduration);
            }
        }
    }

}

//尺変更をするスクリプトを実行する
function Composion_TimeEdit(uiComponents){

    sec  = uiComponents["secTextbox"].text
    koma = uiComponents["komaTextbox"].text

    //最初のエラー確認
    if(sec == 0 && koma == 0 || (sec == "" || koma == "")){
        alert("0+0では実行できません");
        return
    }

    //作品のボールがいくつになっているか
    Selectedbold = SelectBold_list(uiComponents)

    //フレームレートの設定アニメ用だから24FPS固定
    Animation_Fps = 24 

    //尺変えるのはこれが実行
    apply_Compsion_TimeEdit(uiComponents,Selectedbold,Animation_Fps)




}

//追加設定のUI
function preferenceUi(){

    preferencewin = new Window('palette', '電卓の設定です', undefined);

    top_section = uiFactory('panel', preferencewin, {text: '機能の補助設定', orientation: 'column' , preferredSize :[120,-1],alignment : "left"})
    uiFactory('button', top_section, { 
        text: '環境設定を初期化', 
        alignment : "left",
        onClick : function(){
            if(confirm("設定を初期化してよろしいですか？")){
                //環境ファイルを削除する
                new File(appsettings["preferencetxtpath"]).remove()
                loadsettings()
                alert("環境設定は初期化されました")
            }else{
                alert("初期化はキャンセルされました")
            }
        }
    })
    uiFactory('checkbox', top_section, { 
        text: 'カット番号を付ける' , 
        alignment : "left", 
        value : appsettings["CutNumberSwitch"] == "true" , 
        onClick : function(){
            calculatorReplace("CutNumberSwitch", this.value , appsettings["preferencetxtpath"])
        } })
    uiFactory('checkbox', top_section, { 
        text: '選択したコンポにボールド尺を適用する※デフォルトは上から2番目', 
        alignment : "left",
        value : appsettings["TimeAjastSingle"] == "true" , 
        onClick : function(){
            calculatorReplace("TimeAjastSingle", this.value , appsettings["preferencetxtpath"])
        } 
    })
    uiFactory('checkbox', top_section, { 
        text: 'コンポすべての尺を変更する', 
        alignment : "left",
        value : appsettings["TimeAjastAll"] == "true" , 
        onClick : function(){
            calculatorReplace("TimeAjastAll", this.value , appsettings["preferencetxtpath"])
        }
    })
    uiFactory('checkbox', top_section, { 
        text: 'コンポ名をAEPの名前にする', 
        alignment : "left",
        value : appsettings["RenameCompItem"] == "true" , 
        onClick : function(){
            calculatorReplace("RenameCompItem", this.value , appsettings["preferencetxtpath"])
        }
    })

    under_section = uiFactory('group', preferencewin,{orientation: 'row'})
    under_left_section = uiFactory('panel', under_section, {text: '尺プリセット登録', orientation: 'column' , alignment :"left",spacing:0})
    under_center_section = uiFactory('panel', under_section, {text: 'フォルダ指定', orientation: 'column' , alignment :"left",spacing:0})
    under_rigth_section = uiFactory('panel', under_section, {text: 'カットナンバー追加', orientation: 'column' , alignment :"left",spacing:0})


    preferencewin.show()
    preferencewin.center()


}



//メインUIの組み立て
function buildUI() {

    mainwindow = new Window('palette', '尺を変えられます', undefined, { resizeable: true });
    mainwindow.orientation = 'column';
    mainwindow.alignChildren = 'fill';
    mainwindow.spacing = 5

    // 尺を入力するところ
    input_section = uiFactory('group', mainwindow, { orientation: 'row' , alignment: ["left","top"]})
    uiFactory('statictext', input_section, { text: '秒' })
    Sec_Textbox = uiFactory('edittext', input_section, { text: '0', preferredSize: [40, 20] })
    uiFactory('statictext', input_section, { text: '+ コマ' })
    koma_Textbox = uiFactory('edittext', input_section, { text: '0', preferredSize: [40, 20] })
    uiFactory('button', input_section, { 
        text: 'OK', 
        preferredSize: [40, 20] ,
        onClick : function(){
            Composion_TimeEdit(uiComponents)
        }
    })


    //プリセットの類を調整する
    preset_section = uiFactory('group', mainwindow, { orientation: 'row' , alignment: ["left","top"]})
    BoldTime_dp = uiFactory('dropdownlist', preset_section, { 
        items: ["bold:00","bold:01","bold:08","bold:10"] ,
        selection : appsettings["TimeBoldselect"] , 
        onChange : function(){
            calculatorReplace("TimeBoldselect", this.selection.index , appsettings["preferencetxtpath"])
        } 
    })
    uiFactory('statictext', preset_section, { text: 'preset:' })
    uiFactory('dropdownlist', preset_section, { items: ["01+12","02+15"] , selection : 1})
    uiFactory('button', preset_section, { 
        text: '設定',
         preferredSize: [30, 20] ,
         onClick : function(){
            preferenceUi()
        }
    })

    //UI読み込み用のコンポーネント
    uiComponents = {
        secTextbox : Sec_Textbox,//秒の設定
        komaTextbox : koma_Textbox,//コマの設定
        boldDropdown : BoldTime_dp,//ボールドがどれを選ばれているか
    }

    //テンキー部分を作成する
    keypad_section = uiFactory('group', mainwindow, { orientation: 'column' , alignment: ["fill","fill"]})
    createKeypad(keypad_section,uiComponents)

    
    mainwindow.onResizing = mainwindow.onResize = function () { this.layout.resize(); }
    return mainwindow;
}

function main(){

}

//設定をグローバル変数にする
appsettings = {};
//環境設定の書き込みなどをする
loadsettings();
//UIを作る
myUI = buildUI();
myUI.center();
myUI.show();
