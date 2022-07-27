/*******************************************************************************
 * 파 일 명 : util-common.js 작 성 일 : 2016. 03. 11 작 성 자 : 최재헌 프로그램 용도 : UTIL 공통 클랙스
 * 및 함수 선언 수 정 내 용 :
 *
 ******************************************************************************/
var util = function() {
	if (!(this instanceof arguments.callee)) {
		return new util();
	}
};

/*******************************************************************************
 * 함 수 명 : startsWith 함수설명 : startsWith 크로스
 ******************************************************************************/
if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str) {
		return this.indexOf(str) == 0;
	};
}

String.prototype.format = function() {
	var s = this, i = arguments.length;
	while (i--) {
		s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	}
	return s;
};

util.prototype.string = {
	getConvertStr : function(str) {
		var rtn = "";
		$.ajax({
			type : "POST",
			async : false,
			url : "/cmcom/convert-string.json",
			data : {
				"str" : str
			},
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				rtn = data.result;
			}
		});
		return rtn;
	}
	/***************************************************************************
	 * str에 내용이 null이면 selDef의 내용을 넘겨준다.
	 *
	 * @param str
	 *            입력문자열
	 * @param selDef
	 *            NULL 일경우 리턴값.
	 **************************************************************************/
	,
	isNull : function(str, selDef) {
		if (util.string.isEmpty(str)) {
			return selDef;
		} else {
			return str;
		}
	}
	/***************************************************************************
	 * 입력된 문자가 NULL 인지 확인한다.
	 *
	 * @param selValue
	 *            문자
	 **************************************************************************/
	,
	isEmpty : function(selValue) {
		if (selValue == null || typeof (selValue) == "undefined"
				|| $.trim(selValue) === "" || selValue == "NULL"
				|| selValue == "null") {
			return true;
		}
		return false;
	}
	/***************************************************************************
	 * 문자열 값을 체크하여 준다.
	 *
	 * @param strValue
	 *            문자열
	 * @param optValue
	 *            N:정수형숫자,F:실수형숫자, E:영문,A:영문대문자 ,a:영문소문자, H:한글 opt는 중복허용 예 :
	 *            "NEAaH" 숫자,영대문자,소문자,한글 // N : 숫자만 있을 경우 true // E : 영문만 있을 경우
	 *            true // A : 영문 대문자만 있을 경우 true // a : 영문 소문자만 있을 경우 true // H :
	 *            한글만 있을 경우 true
	 * @param optExp
	 *            추가 체크 정규식
	 **************************************************************************/
	,
	checkString : function(strValue, optValue, optExp) {
		var rtnValue = false;
		var flag_N = false;
		var flag_F = false;
		var flag_E = false;
		var flag_A = false;
		var flag_a = false;
		var flag_H = false;
		var optValueLength = optValue.length;
		if (optValue == null || optValue == "") {
			return true;
		}
		for (var i = 0; i < optValue.length; i++) {
			if (optValue.charAt(i).toUpperCase() == "N") {
				flag_N = true;
			}
			if (optValue.charAt(i).toUpperCase() == "F") {
				flag_F = true;
			}
			if (optValue.charAt(i).toUpperCase() == "E") {
				flag_E = true;
			}
			if (optValue.charAt(i) == "A") {
				flag_A = true;
			}
			if (optValue.charAt(i) == "a") {
				flag_a = true;
			}
			if (optValue.charAt(i).toUpperCase() == "H") {
				flag_H = true;
			}
		}

		var tempRegExp = "";
		if (optExp == null) {
			optExp = "";
		}
		tempRegExp = optExp;
		if (flag_N) { // 정수형
			tempRegExp = tempRegExp + "0-9\-\+";
		}
		if (flag_F) { // 실수형
			tempRegExp = tempRegExp + "0-9\-\+\.";
		}
		if (flag_E) { // 영문자(대소문자구분없음,공백허용)
			tempRegExp = tempRegExp + "A-Za-z\\s";
		}
		if (flag_A) { // 영문대문자
			tempRegExp = tempRegExp + "A-Z\\s";
		}
		if (flag_a) { // 영문소문자.
			tempRegExp = tempRegExp + "a-z\\s";
		}
		if ((flag_N || flag_F) && !flag_E && !flag_A && !flag_a && !flag_H) { // 정수또는
																				// 실수형일
																				// 경우.
			var re = new RegExp("^[" + tempRegExp + "]+$", "g");
			if (strValue != "") {
				if (re.test(strValue)) {
					rtnValue = true;
				}
			}
			if (optExp == "") {
				rtnValue = util.string.isNumber(strValue);
			}
		} else if (!flag_N && !flag_F && !flag_E && !flag_A && !flag_a
				&& flag_H) { // 한글만 있는경우.
			var tempChar = null;
			if (strValue == null || strValue == "") {
				return true;
			}
			var tempStrValue = strValue;
			tempStrValue = tempStrValue.replace(optExp, "");
			var tempStrValueLength = tempStrValue.length;
			for (var i = 0; i < tempStrValueLength; i++) {
				tempChar = tempStrValue.charCodeAt(i);
				if (!((0xAC00 <= tempChar && tempChar <= 0xD7A3) || (0x3131 <= tempChar && tempChar <= 0x318E))) {
					rtnValue = false;
					break;
				} else {
					rtnValue = true;
				}
			}
		} else if ((flag_N || flag_F || flag_E || flag_A || flag_a) && !flag_H) { // 한글만
																					// 없는경우..
			var re = new RegExp("^[" + tempRegExp + "]+$", "g");
			if (strValue != "") {
				if (re.test(strValue)) {
					rtnValue = true;
				}
			}
		} else if ((flag_N || flag_F || flag_E || flag_A || flag_a) && flag_H) {
			var strValueLength = strValue.length;
			var tempCharCode = null;
			var tempChar = null;
			var tempStrValueHangul = "";
			var tempStrValue = "";
			if (strValue == null || strValue == "") {
				return true;
			}
			for (var i = 0; i < strValueLength; i++) {
				tempCharCode = strValue.charCodeAt(i);
				tempChar = strValue.charAt(i);
				if (!((0xAC00 <= tempCharCode && tempCharCode <= 0xD7A3) || (0x3131 <= tempCharCode && tempCharCode <= 0x318E))) {
					tempStrValue = tempStrValue + tempChar;
				}
			}
			var re = new RegExp("^[" + tempRegExp + "]+$", "g");

			if (tempStrValue != "") {
				if (re.test(tempStrValue)) {
					rtnValue = true;
				}
			}
		} else {
			rtnValue = true;
		}
		return rtnValue;
	}
	/**
	 * 숫자 검사.
	 *
	 * @param selValue
	 *            문자열
	 */
	,
	isNumber : function(selValue) {
		if (selValue == null || selValue == "") {
			return false;
		} else if (isNaN(selValue)) {
			return false;
		} else {
			return true;
		}
	}
	/**
	 * html Tag 를 벗겨냄
	 *
	 * @param selValue
	 *            문자열
	 * @param stringLength
	 *            문자길이
	 */
	,
	stripTags : function(selValue, stringLength) {
		var retVal = $(selValue).text();
		if ($(retVal).length > stringLength) {
			retVal = retVal.substring(stringLength) + "...";
		}
		return retVal;
	},
	getNumber : function(strValue) {
		var resultValue = "";
		// 입력된 값이 숫자가 아닌 경우 한글자씩 잘라서 앞부터 숫자만 뽑아서 폼에 등록
		if (!util.string.isNumber(strValue)) {
			for (var i = 0; i < strValue.length; i++) {
				var changeVal = strValue.substring(i, i + 1);
				if (util.string.isNumber(changeVal)) {
					resultValue += changeVal;
				}
			}
		} else {
			resultValue = strValue;
		}
		return resultValue;
	},
	getTelNumArray : function(strValue) {
		var rtnValue = new Array();
		var telNum = util.format.formatTelNo(strValue);
		rtnValue = telNum.split("-");
		return rtnValue;
	},
	isValidSSN2 : function(strValue) {
		var num = strValue;
		if (num == '') {
			alert("주민등록번호를 정확하게 입력해주세요.");
			numObj.focus();
			return false;
		}
		if (num.length != 13) {
			alert("주민등록번호를 '-' 를 제외한 13자리 숫자로 입력하세요.");
			numObj.focus();
			return false;
		}
		if (isNaN(num)) {
			alert("주민등록번호는 숫자만 입력이 가능합니다.");
			numObj.focus();
			return false;
		}

		var ssn1 = num.substring(0, 6);
		var ssn2 = num.substring(6, 13);
		if ((ssn1.length == 6) && (ssn2.length == 7)) {
			var ssn = ssn1 + ssn2;
			a = new Array(13);
			for (var i = 0; i < 13; i++) {
				a[i] = parseInt(ssn.charAt(i));
			}
			var k = 11 - (((a[0] * 2) + (a[1] * 3) + (a[2] * 4) + (a[3] * 5)
					+ (a[4] * 6) + (a[5] * 7) + (a[6] * 8) + (a[7] * 9)
					+ (a[8] * 2) + (a[9] * 3) + (a[10] * 4) + (a[11] * 5)) % 11);

			if (k > 9) {
				k -= 10;
			}
			if (k == a[12]) {
				return true;
			} else {
				alert("잘못된 주민등록번호 입니다.\n다시 입력해 주세요.");
				numObj.value = "";
				numObj.focus();
				return false;
			}
		}
	}
	// 외국인 주민번호 체크 san24 20080704
	,
	isRegNo_fgnno : function(fgnno) {
		var sum = 0;
		var odd = 0;
		buf = new Array(13);
		for (i = 0; i < 13; i++) {
			buf[i] = parseInt(fgnno.charAt(i));
		}
		odd = buf[7] * 10 + buf[8];
		if (odd % 2 != 0) {
			return false;
		}
		if ((buf[11] != 6) && (buf[11] != 7) && (buf[11] != 8)
				&& (buf[11] != 9)) {
			return false;
		}
		multipliers = [ 2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5 ];
		for (i = 0, sum = 0; i < 12; i++) {
			sum += (buf[i] *= multipliers[i]);
		}
		sum = 11 - (sum % 11);
		if (sum >= 10) {
			sum -= 10;
		}
		sum += 2;
		if (sum >= 10) {
			sum -= 10;
		}
		if (sum != buf[12]) {
			return false;
		}
		return true;
	},
	onlyNum : function(selector) {
		var supportImeMode = ("ime-mode" in document.body.style), regex = /[^0-9]+/g;
		$(selector).css("ime-mode", "disabled").on(
				"keydown",
				function(e) {
					var $target = $(this), code = e.which;
					if (supportImeMode) {
						// 허용문자 : 백스페이스(8), 탭(9), 방향키 좌우(37, 38), Delete(46),
						// 숫자(48 ~ 57), 넘버패드 숫자(96 ~ 105), Ctrl+c(17+67),
						// Ctrl+v(17+86)
						if (code === 8 || code === 9 || code === 37
								|| code === 38 || code === 46
								|| (code >= 48 && code <= 57)
								|| (code >= 96 && code <= 105) || code === 17
								|| (ctrlDown && code === 67)
								|| (ctrlDown && code === 86)) {
							return true;
						} else {
							return false;
						}
					} else {
						setTimeout(function() {
							$target.val($target.val().replace(regex, ""));
						}, 1);
					}
				}).on("blur", function() {
			var $this = $(this);
			// placeholder인 경우 리플레이스 스킵
			if ($this.attr("title") === $this.val()) {
				return false;
			}
			$this.val($this.val().replace(regex, ""));
		});
	},
	noHangul : function(selector) {
		var supportImeMode = ("ime-mode" in document.body.style), regex = /[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]+/g; // 한글
																															// 패턴(ㄱ-ㅎ,ㅏ-ㅣ,가-힣)
																															// 유니코드
		$(selector).css("ime-mode", "disabled").on("keydown", function(e) {
			var $target = $(this), code = e.which;
			if (!supportImeMode) {
				setTimeout(function() {
					$target.val($target.val().replace(regex, ""));
				}, 1);
			}
		}).on("blur", function() {
			var $this = $(this);
			// placeholder인 경우 리플레이스 스킵
			if ($this.attr("title") === $this.val()) {
				return false;
			}
			$this.val($this.val().replace(regex, ""));
		});
	},
	numAndHangul : function(selector) {
		var supportImeMode = ("ime-mode" in document.body.style), regex = /[^\u3131-\u314e|^\u314f-\u3163|^\uac00-\ud7a3|^0-9]+/g; // 한글
																																	// 패턴(ㄱ-ㅎ,ㅏ-ㅣ,가-힣)
																																	// 유니코드
		$(selector).on("keydown", function(e) {
			var $target = $(this), code = e.which;
			if (!supportImeMode) { // 크롬 등
				setTimeout(function() {
					$target.val($target.val().replace(regex, ""));
				}, 1);
			} else { // 익스
				setTimeout(function() {
					$target.val($target.val().replace(regex, ""));
				}, 1);
			}
		}).on("blur", function() {
			var $this = $(this);
			// placeholder인 경우 리플레이스 스킵
			if ($this.attr("title") === $this.val()) {
				return false;
			}
			$this.val($this.val().replace(regex, ""));
		});
	}
};

util.prototype.number = {
	/**
	 * int 숫자 변환한다. 값이 없거나 문자열등 숫자로 변환할수 없을 경우 0 을 돌려준다.
	 *
	 * @param selValue :
	 *            값
	 */
	getInt : function(selValue) {
		var rtnValue = 0;
		var charValue = selValue + "";
		var tempValue = charValue.replace(/,/g, "");
		if (util.string.isNumber(tempValue) == false) {
			return rtnValue;
		}
		try {
			rtnValue = parseInt(tempValue - 0);
		} catch (e) {
			rtnValue = 0;
		}
		return rtnValue;
	}
	/**
	 * 반올림.
	 *
	 * @param selValue :
	 *            값
	 */
	,
	getRoundUp : function(selValue, selPos) {
		var rtnValue = selValue;
		var tempPow = Math.pow(10, selPos);
		var tempSelValue = selValue;
		if (selValue < 0) {
			tempSelValue = selValue * (-1);
		}
		rtnValue = Math.ceil(tempSelValue * tempPow) / tempPow;
		if (selValue < 0) {
			rtnValue = rtnValue * (-1);
		}
		return rtnValue;
	}
};

/**
 * XSS 관련 함수...
 */
util.prototype.xss = {
	/**
	 *
	 * @param chkStr
	 * @returns {Boolean}
	 */
	isXss : function(chkStr) {
		var rtnValue = false, test_str_low = chkStr;
		if (test_str_low == null || test_str_low == ""
				|| typeof (test_str_low) == "undefined") {
			return rtnValue;
		}
		// 스크립트 문자열 필터링 (선별함 - 필요한 경우 보안가이드에 첨부된 구문 추가)
		if (test_str_low.indexOf("javascript") >= 0
				|| test_str_low.indexOf("script") >= 0
				|| test_str_low.indexOf("iframe") >= 0
				|| test_str_low.indexOf("document") >= 0
				|| test_str_low.indexOf("vbscript") >= 0
				|| test_str_low.indexOf("applet") >= 0
				|| test_str_low.indexOf("embed") >= 0
				|| test_str_low.indexOf("object") >= 0
				|| test_str_low.indexOf("frame") >= 0
				|| test_str_low.indexOf("grameset") >= 0
				|| test_str_low.indexOf("layer") >= 0
				|| test_str_low.indexOf("bgsound") >= 0
				|| test_str_low.indexOf("alert") >= 0
				|| test_str_low.indexOf("onblur") >= 0
				|| test_str_low.indexOf("onchange") >= 0
				|| test_str_low.indexOf("onclick") >= 0
				|| test_str_low.indexOf("ondblclick") >= 0
				|| test_str_low.indexOf("enerror") >= 0
				|| test_str_low.indexOf("onfocus") >= 0
				|| test_str_low.indexOf("onload") >= 0
				|| test_str_low.indexOf("onmouse") >= 0
				|| test_str_low.indexOf("onscroll") >= 0
				|| test_str_low.indexOf("onsubmit") >= 0
				|| test_str_low.indexOf("onunload") >= 0) {
			rtnValue = true;
		}
		return rtnValue;
	},
	chkXss : function(chkStr) {
		if (util.xss.isXss(chkStr)) {
			util.alert("현재 사이트 보안을 위해서   스크립트 특수 구분은 작성할 수 없습니다. ");
			return false;
		}
		return true;
	},
	chkForm : function(formObj) {
		var inputObj = $(formObj).find("input,textarea"), tempValue = null, tempChk = false, rtnValue = true;
		inputObj.each(function() {
			tempValue = $(this);
			tempChk = true;
			if ($(tempValue).attr("name") == undefined
					&& $(tempValue).attr("id") == undefined) {
				tempChk = false;
			}
			if (tempChk) {
				if (!util.xss.chkXss($(tempValue).val())) {
					rtnValue = false;
					return false;
				}
			}
		});
		if (tempValue != null && rtnValue == false) {
			$(tempValue).focus();
		}
		return rtnValue;
	}
	/**
	 *
	 * @param paramBody
	 */
	,
	chkParam : function(paramBody) {
		var rtnValue = true;
		if (!util.xss.chkXss(JSON.stringify(paramBody))) {
			rtnValue = false;
		}
		return rtnValue;
	},
	escapeHTML : function(str) {
		return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g,
				"&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
				.replace(/\//g, "&#x2f;");
	},
	unescapeHTML : function(str) {
		return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(
				/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#x2f;/g, "/")
				.replace(/&amp;/g, "&");
	}
};
/*
 * goNextFocus : inputArray 순차적으로 focus이동처리 goNextForm : maxlength 체크해서
 * focus이동처리
 *
 */
util.prototype.form = {
	/*
	 * checkboxSet : 체크박스에서 입력된 값과 동일한 값이 있는경우 체크설정 checkboxGet : 체크박스에서 체크된 값을
	 * 가져옴 (여러개의 체크가 있기 때문에 array 로 리턴) checkedIndex : 체크박스에서 체크된 인덱스를 가져옴 (여러개의
	 * 체크가 있기 때문에 index를 array 로 리턴) radioSet : 라디오에서 입력된 값과 동일한 값이 있는 경우 체크
	 * radioGet : 라디오에서 체크된 값을 가져옴 (String 으로 리턴) selectSet : 셀렉트 에 값을 셋팅
	 * selectSetJsonArray : json Array 를 이용해서 셀렉트에 값을 셋팅 selectGet : 셀렉트에서
	 * selected 된 값을 가져옴 (멀티셀렉트 불가함. String 으로 리턴) selectCheck : 셀렉트에서 특정 값이 있는
	 * 경우 selected 처리 makeHidden : 히든필드 생성
	 */
	checkboxSet : function(checkboxName, setVal) {
		$(':checkbox[name=' + checkboxName + ' ][value=' + setVal + ']').attr(
				'checked', 'checked'); // from value
	},
	checkboxGet : function(checkboxName) {
		var retVal = new Array();
		var frmck = document.getElementsByName(checkboxName);
		for (var i = 0; i < frmck.length; i++) {
			if (frmck[i].checked == true) {
				retVal.push(frmck[i].value);
			}
		}
		$("input :checkbox[name=" + checkboxName + "[] ]:checked").each(
				function() {
					retVal.push($(this).val());
				});
		return retVal;
	},
	checkedIndex : function(checkboxName) {
		var indexi = 0;
		var retVal = new Array();
		var frmck = document.getElementsByName(checkboxName);
		for (var i = 0; i < frmck.length; i++) {
			if (frmck[i].checked == true) {
				retVal.push(i);
			}
		}
		return retVal;
	},
	radioSet : function(radioName, setVal) {
		$(':radio[name=' + radioName + ' ][value=' + setVal + ']').attr(
				'checked', 'checked'); // from value
	},
	radioGet : function(radioName) {
		var retVal = $(":radio[name=" + radioName + " ]:checked").val();
		return retVal;
	},
	setCardYear : function(selectObject, fnc) {
		var thisYear = new Date().getFullYear();
		var setParam = null;
		var setVal = new Array();
		// setParam = {"code" : "","value" : "선택"};
		// setVal.push(setParam);
		for (var i = 0; i < 8; i++) {
			writeYear = thisYear + i;
			setParam = {
				"code" : writeYear,
				"value" : writeYear
			};
			setVal.push(setParam);
		}
		util.form.selectSetJsonArray(selectObject, setVal, "", fnc);
	},
	setCard2Year : function(selectObject, fnc) {
		var thisYear = new Date().getFullYear();
		var setParam = null;
		var setVal = new Array();
		// setParam = {"code" : "","value" : "선택"};
		// setVal.push(setParam);
		for (var i = 0; i < 8; i++) {
			writeYear = thisYear + i;
			setParam = {
				"code" : parseInt(writeYear.toString().substr(2)),
				"value" : parseInt(writeYear.toString().substr(2))
			};
			setVal.push(setParam);
		}
		util.form.selectSetJsonArray(selectObject, setVal, "", fnc);
	},
	// selectObject : div.select_list
	// setVal : option 배열
	// selectedVal : default 옵션 및 선택 옵션 정보 오브젝트
	selectSetJsonArray : function(selectObject, setVal, selectedVal, callBack) {
		if (!!!setVal || setVal.length === 0 || !!!setVal[0]) {
			return "";
		}
		var options = [], setValCnt = setVal.length, selected = selectedVal, isSelected = false, selectedText = "";

		if (typeof selectedVal === "object") {
			selected = selectedVal.selectedVal;
		}

		// 최초 값이 있는 경우
		if (selectedVal.defaultText != ""
				&& selectedVal.defaultText != undefined) {
			options.push('<li><button type="button" name="'
					+ selectedVal.defaultVal + '">' + selectedVal.defaultText
					+ '<span>선택</span></button></li>');
		}
		for (var i = 0; i < setValCnt; i++) {
			var optionVal = setVal[i];
			options.push('<li><button type="button" name="' + optionVal.code
					+ '">' + optionVal.value + '<span>선택</span></button></li>');
			if (selected === optionVal.code) {
				selectedText = optionVal.value;
				isSelected = true;
			}
		}

		selectObject.find("ul").html(options.join(""));

		if (isSelected) {
			selectObject.find("input[type='hidden']").val(selected); // 문자열일
																		// 경우
																		// 선택값으로
																		// 간주
			selectObject.find("input[type='hidden']").attr("title",
					selectedText);
		} else {
			selectObject.find("input[type='hidden']").val(""); // 문자열일 경우 선택값으로
																// 간주
			selectObject.find("input[type='hidden']").attr("title", "");
		}

		var rtn = "";
		if (selectedVal.defaultText == "직접입력") {
			rtn = $plugin.selectlist(selectObject, {
				selectType : 'form',
				selectEvent : 'button',
				headlineDefault : '직접입력',
				callBack : function() {
					// console.log(this);
				}
			});
		} else if (selectedVal.defaultText == "면허지역선택") {
			rtn = $plugin.selectlist(selectObject, {
				selectType : 'form',
				selectEvent : 'button',
				headlineDefault : '면허지역선택',
				callBack : function() {
					// console.log(this);
				}
			});

		} else {
			rtn = $plugin.selectlist(selectObject, {
				selectType : 'form',
				selectEvent : 'button',
				callBack : function() {
					// console.log(this);
				}
			});
		}
		if (typeof callBack == "function") {
			callBack(rtn);
		}

	},
	selectSet : function(selectObject, setVal, selectedVal) {
		// 기존의 셀렉트 변수를 지운다
		selectObject.find('option').remove();
		// 최초 값이 있는 경우
		if (selectedVal.defaultText != ""
				&& selectedVal.defaultText != undefined) {
			selectObject.append($('<option>', {
				value : selectedVal.defaultVal
			}).text(selectedVal.defaultText));
			if (selectedVal.selectedVal != undefined) {
				selectedVal = "";
			} else {
				selectedVal = selectedVal.selectedVal;
			}
		} else {
		}
		// 값을 추가
		$.each(setVal, function(key, text) {
			selectObject.append($('<option>', {
				value : key
			}).text(text));
		});
		util.form.selectCheck(selectObject, selectedVal);
	},
	selectGet : function(selectObject) {
		return selectObject.find('option :selected').val();
	},
	selectCheck : function(selectObject, selectedVal) {
		// 입력된 값과 동일한 값에 선택
		selectObject.find("option[value='" + selectedVal + "']").attr(
				"selected", "selected");
	},
	selectCheckText : function(selectObject, selectedText) {
		selectObject.find('option').each(function() {
			if ($(this).text() == selectedText) {
				$(this).attr("selected", "selected");
			}
		});
	},
	checkInput : function(objectID, alertMsg) {
		var retVal = false;
		if (util.string.isEmpty($(objectID).val())) {
			alert(alertMsg);
			$(objectID).focus();
		} else {
			retVal = true;
		}
		return retVal;
	},
	goNextForm : function(fromObject, toObject) {
		// 장애인 차별법으로 삭제.
		/*
		 * var fromMaxlength = fromObject.attr("maxlength"); if (fromMaxlength == "" ||
		 * fromMaxlength == undefined || fromMaxlength == null){ return true;
		 * }else{ //maxlength 가 있다면 keyup 이벤트를 통해서 다음 오브젝트에 포커스를 준다.
		 * fromObject.on("keyup", function(e){ if (fromObject.val().length >=
		 * fromMaxlength){ toObject.focus(); return true; }else{ return true; }
		 * }); }
		 */
		return true;
	},
	callFunction : function(ckObject, callbackFunc) {
		// keyup 이벤트에서 엔터라면 지정한 함수 실행
		fromObject.on("keyup", function(e) {
			var keyCode = (window.Event) ? e.which : e.keyCode;
			if (keyCode > 13) {
				callbackFunc.call();
				return true;
			} else {
				return true;
			}
		});
	},
	calanederCreate : function() {
		var _datepicker = $(".datepicker");
		if (arguments.length == 1) {
			_datepicker = $(arguments[0]);
		}
		// datepicker
		_datepicker.each(function(idx, obj) {
			var _this = $(this);
			var isReadonly = false;
			if (_this.attr("readonly") == "readonly") {
				isReadonly = true;
				_this.removeAttr("readonly");
			}
			var buttonOptions = {
				dateFormat : "yy-mm-dd",
				showOn : "both",
				buttonImage : "/images/common/ico_calendar.gif",
				buttonText : _this.attr("title"),
				buttonImageOnly : false,
				changeMonth : true,
				changeYear : true,
				showButtonPanel : true
			};
			if ($(obj).hasClass("ui_icon_none")) {
				buttonOptions = {
					dateFormat : "yy-mm-dd",
					showOn : "focus",
					buttonImageOnly : false,
					changeMonth : true,
					changeYear : true
				};
			}
			_this.datepicker(buttonOptions);
			if (isReadonly) {
				_this.attr({
					readonly : "readonly"
				});
			}
			if (_this.attr("disabled") == "disabled") {
				_this.datepicker("disable");
			}
		});
	}
	/***************************************************************************
	 * 함 수 명 : makeHidden 함수설명 : 히든필드 생성
	 **************************************************************************/
	,
	makeHidden : function(name, value, objForm) {
		var hidden = document.createElement("input");
		hidden.setAttribute("type", "hidden");
		hidden.setAttribute("name", name);
		hidden.setAttribute("value", value);

		if (objForm) {
			objForm.appendChild(hidden);
		} else {
			return hidden;
		}
	}
	/***************************************************************************
	 * 함 수 명 : makeForm 함수설명 : 임의의 form 생성 util.form.makeForm("list.do");
	 **************************************************************************/
	,
	makeForm : function(fAction, isGet) {
		var f = document.createElement("form");
		$("body").append(f);
		f.method = (isGet) ? "GET" : "POST";
		f.action = fAction;
		return f;
	},
	makeFormKr : function(fAction, isGet) {
		var f = document.createElement("form");
		$("body").append(f);
		f.acceptCharset = "euc-kr";
		f.method = (isGet) ? "GET" : "POST";
		f.action = fAction;
		return f;
	}
	/***************************************************************************
	 * 함 수 명 : makeMailPrintForm 함수설명 : 인크루드될 오즈or메일발송 선택 폼
	 **************************************************************************/
	,
	makeMailPrintForm : function(divId) {
		$.ajax({
			type : "POST",
			dataType : "html",
			url : '/fplaza/proof/choice-email-print.do',
			data : {},
			async : false,
			success : function(html) {
				$("#" + divId).append(html);
			}
		});
	}
};
/*******************************************************************************
 * 함 수 명 : validate 함수설명 : 패턴체크
 *
 * isMobilePhone(휴대폰번호) : 휴대폰번호 패턴 체크 isHomePhone(집전화번호) : 집전화번호 패턴 체크
 * isNumber(숫자) : 숫자 패턴 체크
 *
 * @returns {boolean}
 ******************************************************************************/
util.prototype.validate = {
	/***************************************************************************
	 * 함 수 명 : isMobile 함수설명 : 휴대폰번호 체크
	 *
	 * @param obj :
	 *            휴대폰번호
	 * @returns {boolean}
	 **************************************************************************/
	isMobilePhone : function(obj) {
		return (/01[016789][1-9]{1}[0-9]{2,3}[0-9]{4}$/).test(obj);
	},
	/***************************************************************************
	 * 함 수 명 : isHomePhone 함수설명 : 전화번호 체크
	 *
	 * @param obj :
	 *            전화번호
	 * @returns {boolean}
	 **************************************************************************/
	isHomePhone : function(obj) {
		return (/02|0[3-9]{1}[0-9]{1}[1-9]{1}[0-9]{2,3}[0-9]{4}$/).test(obj);
	},
	/***************************************************************************
	 * 함 수 명 : isNumber 함수설명 : 숫자체크
	 *
	 * @param obj :
	 *            숫자
	 * @returns {boolean}
	 **************************************************************************/
	isNumber : function(obj) {
		return (/^[\d\,]*$/g).test(obj);
	},
	/***************************************************************************
	 * 함 수 명 : isNotNumber 함수설명 : 숫자제외 체크
	 *
	 * @param obj :
	 *            숫자
	 * @returns {boolean}
	 **************************************************************************/
	isNotNumber : function(obj) {
		return !(/^[\d\,]*$/g).test(obj);
	},
	/***************************************************************************
	 * 함 수 명 : isDate 함수설명 : 날짜체크
	 *
	 * @param obj :
	 *            날짜
	 * @returns {boolean}
	 **************************************************************************/
	isDate : function(obj) {
		if ((/[1-2][0-9]{3}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/)
				.test(obj)) {
			var year = obj.substring(0, 4);
			var month = obj.substring(4, 6) - 1;
			var date = obj.substring(6, 8);
			var dt = new Date(year, month, date);
			var thisMonth = dt.getMonth() + 1;
			if (thisMonth < 10) {
				thisMonth = "0" + String(thisMonth);
			} else {
				thisMonth = String(thisMonth);
			}
			var thisDay = dt.getDate();
			if (thisDay < 10) {
				thisDay = "0" + String(thisDay);
			} else {
				thisDay = String(thisDay);
			}
			retDate = String(dt.getFullYear()) + thisMonth + thisDay;
			return obj == retDate;
		} else {
			return false;
		}
	}
	/***************************************************************************
	 * 함 수 명 : isEmail 함수설명 : 이메일 검사
	 **************************************************************************/
	,
	isEmail : function(str) {
		return str
				.match(/[0-9a-zA-Z][_0-9a-zA-Z]*@[_0-9a-zA-Z]+(\.[_0-9a-zA-Z]+){1,2}$/);
	}
};
/*******************************************************************************
 * 함 수 명 : date 함수설명 : 날짜관련함수
 *
 * today : 오늘날짜 가져오기 dateAdd : 지정한 날짜만큼의 날짜 추가 (기준일(20120101), 타입(month, day),
 * 추가일/월 (-6) ) dateDiff : 두 날짜 사이의 기간(일) weekDiff : 두 날짜 사이의 기간(주) monthDiff :
 * 두 날짜 사이의 기간(월) yearDiff : 두 날짜 사이의 기간(연) : 보험나이 계산 : 만 나이 계산
 *
 * @returns {boolean}
 ******************************************************************************/
util.prototype.date = {
	/*
	 * today : 오늘날짜 가져오기 dateAdd : 지정한 날짜만큼의 날짜 추가 dateDiff : 두 날짜 사이의 기간(일)
	 * weekDiff : 두 날짜 사이의 기간(주) monthDiff : 두 날짜 사이의 기간(월) yearDiff : 두 날짜 사이의
	 * 기간(연) : 보험나이 계산 getManAge : 만 나이 계산
	 */
	nowTime : function() {
		var yyymmdd = gst.split(" ")[0].split(".");
		var hhmmss = gst.split(" ")[1].split(":");
		var tempNow = new Date(yyymmdd[0], Number(yyymmdd[1]) - 1, yyymmdd[2],
				hhmmss[0], hhmmss[1], hhmmss[2]);
		tempNow.setSeconds(tempNow.getSeconds() + 5);
		var tempYear = tempNow.getFullYear() + "";
		var tempMonth = ((tempNow.getMonth() - 0) + 1) + "";
		var tempDate = tempNow.getDate() + "";
		var tempHours = tempNow.getHours() + "";
		var tempMinutes = tempNow.getMinutes() + "";
		var tempSeconds = tempNow.getSeconds() + "";
		if (tempMonth.length <= 1) {
			tempMonth = "0" + tempMonth;
		}
		if (tempDate.length <= 1) {
			tempDate = "0" + tempDate;
		}
		if (tempHours.length <= 1) {
			tempHours = "0" + tempHours;
		}
		if (tempMinutes.length <= 1) {
			tempMinutes = "0" + tempMinutes;
		}
		if (tempSeconds.length <= 1) {
			tempSeconds = "0" + tempSeconds;
		}
		return tempYear + tempMonth + tempDate + tempHours + tempMinutes
				+ tempSeconds;
	}
	// 오늘 날짜 리턴
	,
	today : function() {
		var retDate = "";
		var now = new Date(util.date.nowTime().substring(0, 4), util.date
				.nowTime().substring(4, 6) - 1, util.date.nowTime().substring(
				6, 8));
		var thisMonth = now.getMonth() + 1;
		if (thisMonth < 10) {
			thisMonth = "0" + String(thisMonth);
		} else {
			thisMonth = String(thisMonth);
		}
		var thisDay = now.getDate();
		if (thisDay < 10) {
			thisDay = "0" + String(thisDay);
		} else {
			thisDay = String(thisDay);
		}
		retDate = String(now.getFullYear()) + thisMonth + thisDay;
		return retDate;
	}
	// 날짜 더하기 빼기 (입력 형식 : 20120101, 출력형식 : 20120101)
	,
	dateAdd : function(orgDate, dateType, addDate) {
		var retDate = "";
		var date = util.date.newDate(orgDate);
		var newdate = util.date.newDate(orgDate);
		// 연/월/일의 경우에 따라서 대처
		if ("month" == dateType) {
			// 날짜 계산
			newdate.setMonth(newdate.getMonth() + addDate);
			var nd = newdate;
			var thisMonth = nd.getMonth() + 1;
			var thisDay = nd.getDate();
			if (thisDay != date.getDate()) {
				if (thisMonth < 10) {
					thisMonth = "0" + String(thisMonth);
				} else {
					thisMonth = String(thisMonth);
				}
				newdate = util.date.newDate(String(nd.getFullYear())
						+ thisMonth + "01");
				newdate.setDate(newdate.getDate() - 1);
				nd = newdate;
				thisMonth = nd.getMonth() + 1;
				thisDay = nd.getDate();
			}
			if (thisMonth < 10) {
				thisMonth = "0" + String(thisMonth);
			} else {
				thisMonth = String(thisMonth);
			}
			// 출력할 형태로 변환
			if (thisDay < 10) {
				thisDay = "0" + String(thisDay);
			} else {
				thisDay = String(thisDay);
			}
			retDate = String(nd.getFullYear()) + thisMonth + thisDay;
		} else if ("year" == dateType) {
			newdate.setYear(newdate.getFullYear() + addDate);
			var nd = newdate;
			var thisMonth = nd.getMonth() + 1;
			var thisDay = nd.getDate();
			if (thisDay != date.getDate()) {
				if (thisMonth < 10) {
					thisMonth = "0" + String(thisMonth);
				} else {
					thisMonth = String(thisMonth);
				}
				newdate = util.date.newDate(String(nd.getFullYear())
						+ thisMonth + "01");
				newdate.setDate(newdate.getDate() - 1);
				nd = newdate;
				thisMonth = nd.getMonth() + 1;
				thisDay = nd.getDate();
			}
			if (thisMonth < 10) {
				thisMonth = "0" + String(thisMonth);
			} else {
				thisMonth = String(thisMonth);
			}
			// 출력할 형태로 변환
			if (thisDay < 10) {
				thisDay = "0" + String(thisDay);
			} else {
				thisDay = String(thisDay);
			}
			retDate = String(nd.getFullYear()) + thisMonth + thisDay;
		} else {
			// 날짜 계산
			newdate.setDate(newdate.getDate() + addDate);
			var nd = newdate;
			var thisMonth = nd.getMonth() + 1;
			if (thisMonth < 10) {
				thisMonth = "0" + String(thisMonth);
			} else {
				thisMonth = String(thisMonth);
			}
			// 출력할 형태로 변환
			var thisDay = nd.getDate();
			if (thisDay < 10) {
				thisDay = "0" + String(thisDay);
			} else {
				thisDay = String(thisDay);
			}
			retDate = String(nd.getFullYear()) + thisMonth + thisDay;
		}
		return retDate;
	},
	dateDiff : function(fromDate, toDate) {
		var fDate = util.date.newDate(fromDate).getTime();
		var tDate = util.date.newDate(toDate).getTime();
		return parseInt((tDate - fDate) / (24 * 3600 * 1000));
	},
	weekDiff : function(fromDate, toDate) {
		var fDate = util.date.newDate(fromDate).getTime();
		var tDate = util.date.newDate(toDate).getTime();
		return parseInt((tDate - fDate) / (24 * 3600 * 1000 * 7));
	},
	monthDiff : function(fromDate, toDate) {
		var d1Y = util.date.newDate(fromDate).getFullYear();
		var d2Y = util.date.newDate(toDate).getFullYear();
		var d1M = util.date.newDate(fromDate).getMonth();
		var d2M = util.date.newDate(toDate).getMonth();
		return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
	},
	yearDiff : function(fromDate, toDate) {
		var d1Y = util.date.newDate(fromDate).getFullYear();
		var d2Y = util.date.newDate(toDate).getFullYear();
		return d2Y - d1Y;
	},
	newDate : function(dayVal) {
		dayVal = dayVal.replace(/[\.-]/g, "");
		var date = new Date(dayVal.substring(0, 4), dayVal.substring(4, 6) - 1,
				dayVal.substring(6, 8));
		return date;
	},
	getDate : function(dt) {
		var date = new Date(dt);
		var tempYear = date.getFullYear() + "";
		var tempMonth = ((date.getMonth() - 0) + 1) + "";
		var tempDate = date.getDate() + "";
		if (tempMonth.length <= 1) {
			tempMonth = "0" + tempMonth;
		}
		if (tempDate.length <= 1) {
			tempDate = "0" + tempDate;
		}
		return tempYear + tempMonth + tempDate;
	},
	getWeekDay : function(dayVal) {
		var nowDay = util.date.newDate(util.format.formatDate(dayVal));
		var weekDay = nowDay.getDay();
		return weekDay;
	}
	/***************************************************************************
	 * 함 수 명 : getManAge 함수설명 : 만연령 반환 birth = year를 69 가 아닌 1969 yyyy 로넣을것
	 **************************************************************************/
	,
	getManAge : function(birth) {
		birth = birth.replace(/\./g, "").replace(/-/g, "");
		var year = util.info.getServerTime("yyyy"), monthDay = util.info
				.getServerTime("MMdd"), birthYy = birth.substr(0, 4), birthMd = birth
				.substr(4, 4);
		return monthDay < birthMd ? year - birthYy - 1 : year - birthYy;
	},
	datepicker : function(selector) {
		var supportImeMode = ("ime-mode" in document.body.style), regex = /[^0-9]+/g;
		$(selector)
				.css("ime-mode", "disabled")
				.on(
						"keydown",
						function(e) {
							var $target = $(this), code = e.which;
							if (supportImeMode) {
								// 허용문자 : 백스페이스(8), 탭(9), 방향키 좌우(37, 38),
								// Delete(46), 숫자(48 ~ 57), 넘버패드 숫자(96 ~ 105),
								// Ctrl+c(17+67), Ctrl+v(17+86)
								if (code === 8 || code === 9 || code === 37
										|| code === 38 || code === 46
										|| (code >= 48 && code <= 57)
										|| (code >= 96 && code <= 105)
										|| code === 17
										|| (ctrlDown && code === 67)
										|| (ctrlDown && code === 86)) {
									return true;
								} else {
									return false;
								}
							} else {
								setTimeout(function() {
									$target.val($target.val()
											.replace(regex, ""));
								}, 1);
							}
						})
				.on("focus", function() {
					$(this).val($(this).val().replace(/[^0-9]+/g, ""));
				})
				.on(
						"blur",
						function() {
							var $this = $(this);
							var alt = $this.prop("alt").split(",");
							var tempDt, yyyy, mm, dd;
							var minDt = new Date();
							var maxDt = new Date();
							minDt.setDate(minDt.getDate() - parseInt(alt[0]));
							maxDt.setDate(maxDt.getDate() + parseInt(alt[1]));
							tempDt = $this.val().replace(/[^0-9]+/g, "");
							if (!tempDt) {
								return;
							}
							if (tempDt.length == 8) {
								var dt = new Date();
								dt.setYear(tempDt.substring(0, 4));
								dt.setMonth(tempDt.substring(4, 6) - 1);
								dt.setDate(tempDt.substring(6, 8));
								if (minDt > dt || maxDt < dt) {
									if (!alt[0]) {
										alert(maxDt.getFullYear()
												+ ((maxDt.getMonth() + 1 + "").length > 1 ? maxDt
														.getMonth() + 1
														: "0"
																+ (maxDt
																		.getMonth() + 1))
												+ ((maxDt.getDate() + "").length > 1 ? maxDt
														.getDate()
														: "0" + maxDt.getDate())
												+ "까지 입력 가능합니다.");
										$this.val("");
										return;
									}
									if (!alt[1]) {
										alert(minDt.getFullYear()
												+ ((minDt.getMonth() + 1 + "").length > 1 ? minDt
														.getMonth() + 1
														: "0"
																+ (minDt
																		.getMonth() + 1))
												+ ((minDt.getDate() + "").length > 1 ? minDt
														.getDate()
														: "0" + minDt.getDate())
												+ "부터 입력 가능합니다.");
										$this.val("");
										return;
									}
									alert(minDt.getFullYear()
											+ ((minDt.getMonth() + 1 + "").length > 1 ? minDt
													.getMonth() + 1
													: "0"
															+ (minDt.getMonth() + 1))
											+ ((minDt.getDate() + "").length > 1 ? minDt
													.getDate()
													: "0" + minDt.getDate())
											+ "부터 "
											+ maxDt.getFullYear()
											+ ((maxDt.getMonth() + 1 + "").length > 1 ? maxDt
													.getMonth() + 1
													: "0"
															+ (maxDt.getMonth() + 1))
											+ ((maxDt.getDate() + "").length > 1 ? maxDt
													.getDate()
													: "0" + maxDt.getDate())
											+ "까지 입력 가능합니다.");
									$this.val("");
									return;
								}
								yyyy = dt.getFullYear();
								mm = (dt.getMonth() + 1 + "").length > 1 ? dt
										.getMonth() + 1 : "0"
										+ (dt.getMonth() + 1);
								dd = (dt.getDate() + "").length > 1 ? dt
										.getDate() : "0" + dt.getDate();
								$this.val(yyyy + "." + mm + "." + dd);
							} else {
								$this.val("");
								alert("날짜를 정확히 입력해주세요. ex) 19800101");
							}
						});
	}
}

util.prototype.format = {
	/***************************************************************************
	 * selVal 를 pattern 형태의 정규표현 형태로 변경 해 리턴 selVal 변경 대상 문자
	 *
	 * @pattern ####,##,## 등 형태로 이뤄진 패턴 값
	 * @doRoof boolean값. true 일 경우 대상 문자의 형태가 정규표현식에 부합 할때 까지 계속 해서 변경
	 **************************************************************************/
	formatting : function(selVal, selPattern, doRoof) {
		var patternArr = new Array(); // 패턴의 각 자리별 숫자의 갯수를 저장하는 배열
		var currentArrSize = 0; // 현재 패턴의 자릿수
		var patternArg = ""; // 정규표현식을 문자로 표현하는 패턴
		var splitIdx = 1; // 패턴 정의를 위한 변수 인덱스
		for (var i = 0; i < selPattern.length; i++) {
			var tmpChar = selPattern.charAt(i); // 입력된 문자의 각 자리 순차 대입
			if (tmpChar == '#') {
				currentArrSize++; // #의 갯수
			} else {
				if (currentArrSize > 0) {
					patternArr[patternArr.length] = currentArrSize; // 자릿수 별 #의
																	// 갯수를 배열에
																	// 대입
					currentArrSize = 0; // 갯수 0으로 초기화
					patternArg = patternArg + '$' + (splitIdx++); // 패턴 생성
				}
				patternArg = patternArg + tmpChar; // #이외의 문자 패턴에 추가
			}
			if (i == selPattern.length - 1) {
				// 마지막 문자가 #으로 끝날 경우 마지막 패턴 자릿수 및 문자 패턴 생성
				if (currentArrSize > 0) {
					patternArr[patternArr.length] = currentArrSize;
					patternArg = patternArg + '$' + (splitIdx++);
				}
			}
		}
		var patternExpStr = ""; // 정규 표현식 변수
		for (var i = 0; i < patternArr.length; i++) {
			var numAmount = util.number.getInt(patternArr[i]); // 패턴의 각 자리 별
																// 자릿수
			if (doRoof == true && i == 0) {
				patternExpStr = patternExpStr + '([0-9]+)'; // 정규 표현식 변수 생성
			} else {
				patternExpStr = patternExpStr + '([0-9]{' + numAmount + '})'; // 정규
																				// 표현식
				// 변수 생성
			}
		}
		var patternExp = new RegExp(patternExpStr);
		if (doRoof == true) {
			// 루프 변수가 true 일 경우 패턴 테스트를 해 계속해서 변환
			while (patternExp.test(selVal)) {
				selVal = selVal.replace(patternExp, patternArg);
			}
		} else {
			selVal = selVal.replace(patternExp, patternArg);
		}
		return selVal;
	}
	/***************************************************************************
	 * selRsno 를 주민번호 형태로 리턴한다. selValue 변경 대상 문자 selToggle 옵션 값에 따라서 뒷자리 전체 또는
	 * 1자리만 돌려준다.
	 **************************************************************************/
	,
	formatRsno : function(selRsno, selToggle) {
		var rtnValue = selRsno;
		if (selToggle == null) {
			selToggle = true;
		}
		if (selRsno != null && selRsno.length >= 7) {
			if (selToggle) {
				rtnValue = selRsno.substring(0, 6) + "-" + selRsno.substring(6);
			} else {
				rtnValue = selRsno.substring(0, 6) + "-"
						+ selRsno.substring(6, 7);
			}
		}
		return rtnValue;
	}
	/***************************************************************************
	 * 이름을 xxx형태로 리턴한다. selValue 변경 대상 문자 selToggle 처음1자리 및 뒤1자리 제외한 전체 XXX
	 **************************************************************************/
	,
	formatNmXXX : function(selNm) {
		var rtnValue = selNm;
		var nmLen = 0;

		if (selNm != null && typeof (selNm) != "undefined") {
			nmLen = selNm.length;
			if (nmLen == 2) {
				rtnValue = selNm.substring(0, 1) + "*";
			} else if (nmLen > 2) {
				rtnValue = selNm.substring(0, 1);
				for (var i = 2; i < nmLen; i++) {
					rtnValue = rtnValue + "*";
				}
				rtnValue = rtnValue + selNm.substring(nmLen - 1, nmLen);
			}
		}
		return rtnValue;
	}
	/***************************************************************************
	 * 사업자또는 주민번호를 xxx형태로 리턴한다. selValue 변경 대상 문자 selToggle 옵션 값에 따라서 뒷자리 전체 또는
	 * 1자리만 돌려준다.
	 **************************************************************************/
	,
	formatRsnoXXX : function(selRsno) {
		var rtnValue = selRsno;
		if (selRsno != null && typeof (selRsno) != "undefined"
				&& selRsno != "[[sp]]userSsn") {
			if (selRsno.length == 10) {
				rtnValue = selRsno.substring(0, 3) + "-"
						+ selRsno.substring(3, 6) + "****";
			} else if (selRsno.length >= 13) {
				rtnValue = selRsno.substring(0, 6) + "-"
						+ selRsno.substring(6, 7) + "******";
			} else {
				rtnValue = selRsno.substring(0, selRsno.length - 3) + "***";
			}
		}
		return rtnValue;
	},
	formatTelNo : function(str) {
		if (!str)
			return "";
		if (str.length < 3)
			return str;
		else if (str.length >= 3 & str.length < 5) {
			return str.replace(/(^0(?:2|[0-9]{2}))([0-9]+$)/, "$1-$2");
		} else if (str.length >= 5 & str.length < 8) {
			return str.replace(/(^0(?:2|[0-9]{2}))([0-9]{3,4})([0-9]+$)/,
					"$1-$2-$3");
		} else {
			return str.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,
					"$1-$2-$3");
		}
	}
	/**
	 * selDate 날짜를 formatStr를 넣어서 변환한다.
	 *
	 * @param selDate
	 *            날짜문자열 YYYYMMDD
	 * @param formatStr
	 *            구분값.
	 */
	,
	formatDate : function(selDate, formatStr) {
		var rtnValue = selDate;
		if (selDate != null && selDate.length >= 2) {
			if (formatStr == null) {
				formatStr = ".";
			}
			rtnValue = util.format.formatting(selDate, "####" + formatStr
					+ "##" + formatStr + "##");
		}
		return rtnValue;
	}
	/**
	 * selTime 날짜를 formatStr를 넣어서 변환한다.
	 *
	 * @param selDate
	 *            날짜문자열 HHMM 또는 HHMMSS
	 * @param formatStr
	 *            구분값.
	 */
	,
	formatTime : function(selTime, formatStr) {
		var rtnValue = selTime;
		if (selTime != null) {
			if (formatStr == null) {
				formatStr = ":";
			}
			if (selTime.length == 4) {
				rtnValue = util.format.formatting(selTime, "##" + formatStr
						+ "##");
			} else if (selTime.length == 6) {
				rtnValue = util.format.formatting(selTime, "##" + formatStr
						+ "##" + formatStr + "##");
			}
		}
		return rtnValue;
	},
	formatDateTime : function(selValue) {
		return util.format.formatting(selValue, "####.##.## ##:##:##");
	},
	formatZipCode : function(selValue) {
		var reValue = "";
		reValue = selValue;
		return reValue;
	},
	removeFormat : function(selValue, formatStr) {
		return selValue.split(formatStr).join("");
	},
	formatComma : function(setValue) {
		var rtnValue = setValue;
		var tempValue = "";
		if (util.string.isNumber(setValue)) {
			var jumPos = (rtnValue + "").indexOf(".");
			var jumBefValue = "";
			var jumAftValue = "";
			if (jumPos >= 0) {
				jumBefValue = (rtnValue + "").substring(0, jumPos);
				jumAftValue = (rtnValue + "").substring(jumPos);
			} else {
				jumBefValue = (rtnValue + "");
				jumAftValue = "";
			}
			var Re = /[+-][^0-9]/g;
			var ReN = /(-?[0-9]+)([0-9]{3})/;
			rtnValue = jumBefValue.replace(Re, '');
			while (ReN.test(rtnValue)) {
				rtnValue = rtnValue.replace(ReN, "$1,$2");
			}
			rtnValue = rtnValue + jumAftValue;
		}
		return rtnValue;
	},
	keyUpFormatting : function(flgcd, value) {
		var rtnRslt = "";
		if (value == null || value == "") {
			rtnRslt = "-";
			return rtnRslt;
		}
		var tmpValue = util.format.removeFormat(value, "[^0-9]");
		var tmpLen = tmpValue.length;
		if (flgcd == "number") {
			if (tmpLen > 15) {
				rtnRslt = tmpValue.substring(0, 15);
			} else {
				rtnRslt = tmpValue;
			}
		} else if (flgcd == "money") {
			if (tmpLen > 15) {
				rtnRslt = util.format.formatting(tmpValue.substring(0, 15),
						"###,###", true);
			} else {
				rtnRslt = util.format.formatting(tmpValue, "###,###", true);
			}
		} else if (flgcd == "date") {
			if (tmpLen > 8) {
				rtnRslt = util.format.formatDate(tmpValue.substring(0, 8), "-");
			} else {
				rtnRslt = util.format.formatDate(tmpValue, "-");
			}
		} else if (flgcd == "rsno") {
			if (tmpLen > 13) {
				rtnRslt = util.format.formatRsno(tmpValue.substring(0, 13),
						true);
			} else {
				rtnRslt = util.format.formatRsno(tmpValue, true);
			}
		} else if (flgcd == "zipcode") {
			if (tmpLen > 6) {
				rtnRslt = util.format
						.formatRsno(tmpValue.substring(0, 6), true);
			} else {
				rtnRslt = util.format.formatZipCode(tmpValue, true);
			}
		}
		return rtnRslt;
	},
	formatCarXXX : function(selnum) {
		var rtnValue = selnum;
		var numLen = 0;
		if (selnum != null && typeof (selnum) != "undefined") {
			numLen = selnum.length;
			if (numLen > 4) {
				rtnValue = "";
				for (i = 0; i < numLen - 4; i++) {
					rtnValue = rtnValue + "*";
				}
				rtnValue = rtnValue + selnum.substring(numLen - 4);
			}
		}
		return rtnValue;
	}
	/***************************************************************************
	 * 계좌번호를 xxx형태로 리턴한다. selnum 변경 대상 문자 selToggle 처음7자리 제외한 전체 XXX
	 **************************************************************************/
	,
	formatNumXXX : function(selnum) {
		var rtnValue = selnum;
		var numLen = 0;
		if (selnum != null && typeof (selnum) != "undefined") {
			numLen = selnum.length;
			if (numLen > 7) {
				rtnValue = selnum.substring(0, 7);
				for (i = 7; i < numLen; i++) {
					rtnValue = rtnValue + "*";
				}
			}
		}
		return rtnValue;
	}
	/***************************************************************************
	 * 전화번호을 xxx형태로 리턴한다. selnum 변경 대상 문자($$$$$$$$$$$$ 형태인경우"-" 인경우 제외)
	 * selToggle 처음3자리 마지막 4자리 제외한 전체 XXX
	 **************************************************************************/
	,
	formatTalXXX : function(seltal) {
		var rtnValue = seltal;
		var talLen = 0;
		if (seltal != null && typeof (seltal) != "undefined") {
			talLen = seltal.length;
			var tal1 = "";
			var tal2 = "";
			var tal3 = "";
			if (talLen > 7) {
				tal1 = seltal.substring(0, 2);
				var num = 0;
				if (tal1 == "02") {
					num = 2;
				} else {
					tal1 = seltal.substring(0, 3);
					num = 3;
				}
				for (i = num; i < talLen - 4; i++) {
					tal2 = tal2 + "*";
				}
				tal3 = seltal.substring(talLen - 4);
				rtnValue = tal1 + "-" + tal2 + "-" + tal3;
			} else {
				tal1 = seltal.substring(0, 3);
				tal2 = seltal.substring(3);
				rtnValue = tal1 + "-" + tal2;
			}
		}
		return rtnValue;
	}
	/***************************************************************************
	 * 이메일을 xxx형태로 리턴한다. selEmail 변경 대상 문 selToggle 처음3자리 제외한 전체 XXX
	 **************************************************************************/
	,
	formatEmailXXX : function(selEmail) {
		var rtnValue = selEmail;
		var emailLen = 0;
		if (selEmail != null && typeof (selEmail) != "undefined") {
			emailLen = selEmail.length;
			if (emailLen > 3) {
				rtnValue = selEmail.substring(0, 3);
				for (var i = 3; i < emailLen; i++) {
					rtnValue = rtnValue + "*";
				}
			}
		}
		return rtnValue;
	}
	/***************************************************************************
	 * 금액을 한글로 변환 inputEle 숫자
	 **************************************************************************/
	,
	numberToHangul : function(number) {
		var units1 = [ "", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십" ], units2 = [
				"", "십", "백", "천" ], units3 = [ "", "만", "억", "조" ], numVal = number
				+ "", numLen = numVal.length, hanVal = "", manCount = 0, i = 0, textWord = "";
		if (isNaN(numVal)) {
			return "";
		}
		for (; i < numLen; i++) {
			textWord = units1[numVal.charAt(i)];
			if (textWord !== "") {
				manCount++;
				textWord += units2[(numLen - (i + 1)) % 4]
			}
			if (manCount !== 0 && (numLen - (i + 1)) % 4 === 0) {
				manCount = 0;
				textWord = textWord + units3[(numLen - (i + 1)) / 4];
			}
			hanVal += textWord;
		}
		if (numVal !== 0) {
			hanVal = hanVal + "원";
		}
		return hanVal;
	},
	makeRandom : function(n2, n1) {
		if (!n1)
			n1 = 0;
		return parseInt(Math.random() * (n2 - n1 + 1)) + n1;
	}
};

/*******************************************************************************
 * 함 수 명 : mask 함수설명 : 개인정보 마스킹 처리
 *
 * ssn : 주민번호 email : 이메일 telNum : 전화번호 accountNum : 계좌번호 carNum : 자동차번호
 ******************************************************************************/
util.prototype.mask = {
	ssn : function(selRsno) {
		var rtnValue = selRsno;
		if (selRsno != null) {
			if (selRsno.length == 10) {
				rtnValue = selRsno.substring(0, 3) + "-"
						+ selRsno.substring(3, 6) + "****";
			} else if (selRsno.length >= 13) {
				rtnValue = selRsno.substring(0, 6) + "-"
						+ selRsno.substring(6, 7) + "******";
			} else {
				rtnValue = selRsno.substring(0, selRsno.length - 3) + "***";
			}
		}
		return rtnValue;
	},
	email : function(selEmail) {
		var rtnValue = selEmail;
		var emailLen = 0;
		if (selEmail != null && typeof (selEmail) != "undefined") {
			emailLen = selEmail.length;
			if (emailLen > 3) {
				rtnValue = selEmail.substring(0, 3);
				for (var i = 3; i < emailLen; i++) {
					rtnValue = rtnValue + "*";
				}
			}
		}
		return rtnValue;
	},
	telNum : function(seltal) {
		var rtnValue = seltal;
		var talLen = 0;
		if (seltal != null && typeof (seltal) != "undefined") {
			talLen = seltal.length;
			var tal1 = "";
			var tal2 = "";
			var tal3 = "";
			if (talLen > 7) {
				tal1 = seltal.substring(0, 2);
				var num = 0;
				if (tal1 == "02") {
					num = 2;
				} else {
					tal1 = seltal.substring(0, 3);
					num = 3;
				}
				for (i = num; i < talLen - 4; i++) {
					tal2 = tal2 + "*";
				}
				tal3 = seltal.substring(talLen - 4);
				rtnValue = tal1 + "-" + tal2 + "-" + tal3;
			} else {
				tal1 = seltal.substring(0, 3);
				tal2 = seltal.substring(3);
				rtnValue = tal1 + "-" + tal2;
			}
		}
		return rtnValue;
	},
	accountNum : function(selnum) {
		var rtnValue = selnum;
		var numLen = 0;
		if (selnum != null && typeof (selnum) != "undefined") {
			numLen = selnum.length;
			if (numLen > 7) {
				rtnValue = selnum.substring(0, 7);
				for (i = 7; i < numLen; i++) {
					rtnValue = rtnValue + "*";
				}
			}
		}
		return rtnValue;
	},
	carNum : function(selnum) {
		var rtnValue = selnum;
		var numLen = 0;
		if (selnum != null && typeof (selnum) != "undefined") {
			numLen = selnum.length;
			if (numLen > 4) {
				rtnValue = "";
				for (i = 0; i < numLen - 4; i++) {
					rtnValue = rtnValue + "*";
				}
				rtnValue = rtnValue + selnum.substring(numLen - 4);
			}
		}
		return rtnValue;
	},
	address : function(selnum) {
		var rtnValue = selnum;
		var numLen = 0;
		if (selnum != null && typeof (selnum) != "undefined") {
			numLen = selnum.length;
			rtnValue = "";
			for (i = 0; i < numLen; i++) {
				rtnValue = rtnValue + "*";
			}
		}
		return rtnValue;
	}
};

/*******************************************************************************
 * 브라우저 버전체크
 *
 * @param
 ******************************************************************************/
util.prototype.getBrowserType = function() {
	var _ua = navigator.userAgent;
	var rv = -1;
	// IE 11, 10, 9, 8
	var trident = _ua.match(/Trident\/(\d.\d)/i);
	if (trident != null) {
		if (trident[1] == "7.0")
			return "IE" + 11;
		if (trident[1] == "6.0")
			return "IE" + 10;
		if (trident[1] == "5.0")
			return "IE" + 9;
		if (trident[1] == "4.0")
			return "IE" + 8;
	}
	// IE 7...
	if (navigator.appName == "Microsoft Internet Explorer")
		rv = "IE" + 7;
	// other
	var agt = _ua.toLowerCase();
	if (agt.indexOf("chrome") != -1)
		return "Chrome";
	if (agt.indexOf("opera") != -1)
		return "Opera";
	if (agt.indexOf("staroffice") != -1)
		return "Star Office";
	if (agt.indexOf("webtv") != -1)
		return "WebTV";
	if (agt.indexOf("beonex") != -1)
		return "Beonex";
	if (agt.indexOf("chimera") != -1)
		return "Chimera";
	if (agt.indexOf("netpositive") != -1)
		return "Netpositive";
	if (agt.indexOf("phoenix") != -1)
		return "Phoenix";
	if (agt.indexOf("firefox") != -1)
		return "Firefox";
	if (agt.indexOf("safari") != -1)
		return "Safari";
	if (agt.indexOf("skipstone") != -1)
		return "Skipstone";
	if (agt.indexOf("netscape") != -1)
		return "Netscape";
	if (agt.indexOf("mozilla/5.0") != -1)
		return "Mozilla";
	return rv;
};
/*******************************************************************************
 * 파일객체 리셋
 *
 * @param
 ******************************************************************************/
util.prototype.resetFile = function(fileObj) {
	// 파일객체 초기화
	if (util.getBrowserType().indexOf("IE") != -1) {
		$(fileObj).replaceWith($(fileObj).clone(true));
		// 위의 방법이 브라우저에따라 정상적으로 동작하지 않을 경우 아래 방법으로 대체해야 함
		// if(util.getBrowserType() == "IE10"){
		// $(fileObj).replaceWith($(fileObj).clone(true));
		// }else{
		// var orgParent = fileObj.parentNode;
		// var orgNext = fileObj.nextSibling;
		//
		// var tmp = document.createElement("form");
		// tmp.appendChild(fileObj);
		// tmp.reset();
		// orgParent.insertBefore(fileObj, orgNext);
		// }
	} else {
		$(fileObj).val("");
	}
};
/*******************************************************************************
 * JSON 객체 데이터 깨짐 방지를 위한 처리함수
 *
 * @param
 ******************************************************************************/
util.prototype.replaceJsonHtmltag = function(str) {
	str = str.replace(/&quot;/gi, "\"");
	str = str.replace(/&#x27;/gi, "\'");
	return str;
};
util.prototype.replaceHtmlToJsonString = function(str) {
	str = str.replace(/\"/gi, "&quot;");
	str = str.replace(/\'/gi, "&#x27;");
	str = str.replace(/</gi, "\&lt;");
	str = str.replace(/>/gi, "\&gt;");
	return str;
};
/*******************************************************************************
 * 로딩 이미지
 *
 * @param
 ******************************************************************************/
util.prototype.loader = {
	loadingPop : null,
	// 로딩이미지 시작
	start : function() {
		// 로딩 카운터 증가
		util.loader.loaderCnt++;
		// 로딩하고 있는게 있다면
		if (util.loader.loaderChker) {
			// 해당 로딩타이머는 강제종료시킨다
			clearTimeout(util.loader.loaderChker);
		}
		// 로딩레이어가 없는 경우
		if ($("#popLoading").length === 0) {
			// 로딩 레이어 오픈
			util.loader.openLoader();
		}
		return false;
	}
	// 로딩레이어 정의
	,
	openLoader : function() {
		$("body")
				.append(
						'<div id="popLoading" class="pop_loading"><p>처리중입니다.</p></div>');
		util.loader.loadingPop = $plugin.popmodal($('#popLoading'), {
			position_auto : false
		});
		util.loader.loadingPop.openOutput();
	}
	// 로딩 레이어 삭제
	,
	closeLoader : function() {
		util.loader.loadingPop.closeOutput();
		$("#popLoading").remove();
	}
	// 로딩레이어 닫기
	,
	end : function() {
		util.loader.loaderCnt--;
		if (util.loader.loaderCnt <= 0) {
			util.loader.loaderCnt = 0;
			util.loader.loaderChker = setTimeout(function() {
				util.loader.closeLoader();
			}, 500);
		}
	},
	loaderChker : null,
	loaderIng : false,
	loaderCnt : 0,
	loaderLongChker : null,
	status : false
};
/*******************************************************************************
 * 안랩(AOS) 설치여부 확인
 *
 * @param sys
 *            시스템(보안로딩 및 팝업은 해당 파라메터 무시)
 * @param callback
 *            콜백함수
 ******************************************************************************/
util.prototype.checkAOS = function() {
	// AOS 설치여부 처리
	$ASTX2.init(
	// 설치된 경우
	function onSuccess() {
		$ASTX2.initNonE2E();
	},
	// 설치되지 않은 경우
	function onFailure() {
		if ($ASTX2.getLastError() == $ASTX2_CONST.ERROR_NOTINST) {
			// 타이머 작동
			util.checkAOSTimer.start();
			// goto install page
			// location.href = "/etc/install01.jsp";
			location.href = "/etc/install.jsp";
		}
	}, 200);
};
/*******************************************************************************
 * 안랩(AOS) 설치여부 확인타이머
 *
 ******************************************************************************/
util.prototype.checkAOSTimer = {
	// 안랩(AOS) 설치여부 확인타이버
	start : function(callback) {
		util.checkAOSTimer.checkCallBack = callback;
		// 타이머 설정
		util.checkAOSTimer.checkTimer = setTimeout(function() {
			// 안랩(AOS) 설치여부 확인
			$ASTX2.init(
			// 설치된 경우
			function onSuccess() {
				util.checkAOSTimer.end();
				$ASTX2.initNonE2E();
				// 콜백함수 호출
				if (!!callback && typeof callback == 'function') {
					callback();
				}
			}
			// 설치되지 않은경우
			, function onFailure() {
				// 설치 상태인지 확인
				if (util.checkAOSTimer.timerStatus) {
					// 타이머 클리어
					clearTimeout(util.checkAOSTimer.checkTimer);
					// 설치 상태가 아닌경우
				} else {
					// 타이머 호출
					util.checkAOSTimer.start(callback);
				}
			}, 750);
		}, 3000);
	},
	checkTimer : {},
	timerStatus : false,
	end : function() {
		clearTimeout(util.checkAOSTimer.checkTimer);
	},
	checkCallBack : null
};
/*******************************************************************************
 * 공인인증서(Delfino) 설치여부 확인
 *
 * @param sys
 *            시스템(보안로딩 및 팝업은 해당 파라메터 무시)
 * @param callback
 *            콜백함수
 ******************************************************************************/
util.prototype.checkDelfino = {
	// 공인인증서 설치여부 확인 시작
	start : function(sys, callback) {
		// 보안프로그램 설치 문구 강제로 셋팅
		util.loader.start("certi");
		// 공인인증서 설치여부 확인
		Delfino.isInstall(false, function(result) {
			// 로딩바 종료
			util.loader.end();
			// 공인인증서가 설치되어 있지 않은 경우
			if (!result) {
				// 설치 안내 페이지 이동
				// location.href = "/etc/install02.jsp";
				location.href = "/etc/install.jsp";
				// 공인인증서가 설치된 경우
			} else {
				// 콜백함수 호출
				if (!!callback && typeof callback == 'function') {
					callback();
				}
			}
		});
	}
	// Timeout 제어용 객체
	,
	popupLayer : {}
	// Timeout 종료
	,
	end : function() {
		clearTimeout(util.checkDelfino.popupLayer);
	}
	// 설치여부 확인 Timer
	,
	installCheck : function(callbackfn) {
		// 타이머 함수 설정
		util.checkDelfino.popupLayer = setTimeout(function() {
			// 공인인증서 설치여부 확인
			Delfino.isInstall(false, function(result) {
				// 공인인증서가 설치되지 않은 경우
				if (!result) {
					// 설치여부 확인 타이머 호출
					util.checkDelfino.installCheck(callbackfn);
					// 공인인증서가 설치된 경우
				} else {
					// 타이머 종료
					util.checkDelfino.end();
					// 콜백함수 호출
					if (!!callbackfn && typeof callbackfn == 'function') {
						callbackfn();
					}
				}
			});
		}, 1000);
	}
};
/** ************************************************************* */
/*******************************************************************************
 * CaptCha 함수
 ******************************************************************************/
util.prototype.captcha = {
	// captcha 초기화
	init : function() {
	}
	// captcha 시작
	,
	start : function(callback) {
		var $captchaPop = $(".pop_captcha");
		load_popup($captchaPop);
		util.captcha.callback = callback;
		util.captcha.changeCaptcha();
		// 새로고침 버튼
		$("#reLoad").off("click").on("click", function() {
			util.captcha.changeCaptcha();
		});
		/*
		 * $("#soundOn").off("click").on("click", function(){
		 * util.captcha.audioCaptcha(); });
		 */
		// 확인버튼
		$("#frmSubmit").off("click").on(
				"click",
				function() {
					var resultData = {
						answer : ""
					};
					if (!util.validation.nullCheck($("#answer").val())) {
						util.alert("명의도용 방지번호를 입력해주세요!.");
						$("#answer").focus();
						return false;
					} else {
						resultData.answer = $("#answer").val();
					}
					if (!!util.captcha.callback
							&& typeof util.captcha.callback == "function") {
						util.captcha.callback(resultData);
					}
					pop_close();
				});
	},
	changeCaptcha : function() {
		$("#captcha").html(
				'<img src="/cmcom/captchaImg.do?rand=' + Math.random() + '"/>');
	},
	winPlayer : function(objUrl) {
		$("#audiocaptcha").html('<bgsound src="' + objUrl + '">');
	},
	audioCaptcha : function() {
		var uAgent = navigator.userAgent;
		var soundUrl = "/cmcom/captAudio.do";
		// IE일 경우
		if (uAgent.indexOf("Trident") > -1 || uAgent.indexOf("MSIE") > -1) {
			winPlayer(soundUrl + "agent=msie&rand=" + Math.random());
			// Chrome일경우
		} else if (!!document.createElement('audio').canPlayType) {
			try {
				new Audio(soundUrl).play();
			} catch (e) {
				winPlayer(soundUrl);
			}
		} else
			window.open(soundUrl, "", "width=1, height=1");
	},
	callback : null
};
/*******************************************************************************
 * 함 수 명 : alert 함수설명 : alert창
 ******************************************************************************/
util.prototype.alert = function(msg, callback) {
	if (typeof callback == "function") {
		// callback();
	}
	// location.href = "/etc/500.html";
	alert("데이터 전송이 지연되고 있습니다. 잠시 후 다시 시도해 보세요.");
};
/*******************************************************************************
 * 함 수 명 : inputValCheck 함수설명 : 입력값을 체크하는 기능
 ******************************************************************************/
util.prototype.inputValCheck = function() {
	// validationObject 변수안의 배열 사이즈만큼 반복하면서 이벤트 설정
	$.each(util.validOption.validationObject, function(i, el) {
		// object의 id에 keydown 이벤트 설정
		$("#" + el).off('keydown').on('keydown', function(e) {
			// isNumber에 배열로 설정된 입력구분값을 설정
			var isNum = util.validOption.isNumber[i];
			util.inputPrevent(e, isNum); // 특정 입력값만 허용하는 스크립트 호출
		});
	});
};
/*******************************************************************************
 * 함 수 명 : inputPrevent 함수설명 : 입력값 중 특정 값만 입력되도록 제한하는 기능
 ******************************************************************************/
util.prototype.inputPrevent = function(evt, gubun) {
	var code; // 입력된 키의 code
	var isShift; // 쉬프트키 클릭여부
	if (window.event) {
		code = window.event.keyCode;
		isShift = !!window.event.shiftKey;
	} else {
		code = evt.which;
		isShift = !!evt.shiftKey;
	}
	if (gubun == 1) {// 숫자만 입력가능하도록 제한
		// 숫자
		if ((!isShift)
				&& ((code > 34 && code < 41) || (code > 47 && code < 58)
						|| (code > 95 && code < 106) || (code == 8 || code == 9
						|| code == 13 || code == 46 || code == 37 || code == 39
						|| code == 36 || code == 35))) {
			if (window.event)
				window.event.returnValue = true;
			return;
		}
	} else if (gubun == 2) {// 한글만 입력가능하도록 제한
		// 한글
		if ((code == 229)
				|| (code == 8 || code == 9 || code == 13 || code == 46
						|| code == 37 || code == 39 || code == 36 || code == 35)) {
			if (window.event)
				window.event.returnValue = true;
			return;
		}
	} else if (gubun == 3) {// 영어만 입력가능하도록 제한
		// 영어
		if ((code >= 65 && code <= 90)
				|| (code == 8 || code == 9 || code == 13 || code == 46
						|| code == 37 || code == 39 || code == 36 || code == 35)) {
			if (window.event)
				window.event.returnValue = true;
			return;
		}
	} else if (gubun == 4) {// 한글 영어 입력가능하도록 제한
		// 한글 영어
		if ((code >= 65 && code <= 90)
				|| (code == 229)
				|| (code == 8 || code == 9 || code == 13 || code == 46
						|| code == 37 || code == 39 || code == 36 || code == 35)) {
			if (window.event)
				window.event.returnValue = true;
			return;
		}
	} else if (gubun == 5) { // 영어 숫자
		if (code == 8 || code == 9 || code == 37 || code == 39 || code == 46
				|| code != 229) {
			if (window.event)
				window.event.returnValue = true;
			return;
		}
	} else {
		if (window.event)
			window.event.returnValue = true;
		return;
	}
	if (window.event) {
		window.event.returnValue = false;
		evt.preventDefault();
	} else {
		evt.preventDefault();
	}
};
/*******************************************************************************
 * 이탈 팝업
 *
 * @param gb
 *            (자동차 : ccr, 여행35미만: gni_down, 여행35이상: gni_up, 주택 : hous, 치아35미만:
 *            dntl_down, 치아35이상: dntl_up
 ******************************************************************************/
util.prototype.popOut = function(gb) {
	if (gb == undefined || gb == "") {
		return false;
	}
	var popMargTop = ($('#pop_out').height()) / 2;
	var popMargLeft = ($('#pop_out').width()) / 2;
	$('#pop_out').css({
		'margin-top' : -popMargTop,
		'margin-left' : -popMargLeft,
		'position' : 'absolute'
	});
	// 로딩있으면 지우기
	$(".loadWarp").remove();
	$('#pop_out').show();
	$('#pop_out').find(".pop_con").hide();
	$('#pop_out').find("#" + gb).show();
	$('.pop_fade').css('opacity', '0.5').show();
	$('#pop_out').focus();
	// 닫기버튼 재정의
	$('#pop_out').find(".pop_close").off("click").on("click", function() {
		$('#pop_out').hide();
		$('#alert_fade').hide();
		$('#alert_fade').css('z-index', '');
		$('.pop_fade').hide();
		location.href = '/index.do';
	});
};
/*******************************************************************************
 * 로그인 시간 체크
 *
 * @param
 ******************************************************************************/
util.prototype.loginTimeCheck = {
	countTimer : {},
	loginTime : 0,
	timeoutWaringSec : 60 * 10 // 자동로그아웃 안내 팝업 뜨는 시간(10분)
	,
	timeoutSec : 60 * 11 // 자동로그아웃 시간(11분)
	,
	$authTimeLeft : $("#authTimeLeft"),
	sessionPop : $plugin.popmodal($('#uiPOPSesseion')),
	isOpen : true // 레이어 오픈 여부
	,
	getTimeText : function() {
		var time = this.timeoutSec - this.loginTime;
		var min = 0, sec = 0;
		min = Math.floor((time % (3600)) / 60);
		sec = (time % (3600)) % 60;
		if (sec < 10)
			sec = "0" + sec;
		var retunVal = sec;
		if (min > 0) {
			if (min < 10)
				min = "0" + min;
			retunVal = min + ":" + retunVal;
		} else {
			retunVal = "00:" + retunVal;
		}
		return retunVal;
	}
	// 인증팝업 초기화 및 이벤트 설정
	,
	start : function() {
		// 접속페이지 URL
		var locationHref = location.href;
		// 인증시간 체크 시작
		util.loginTimeCheck.countDown();
		// 연장하기 버튼 이벤트
		$("#uiPOPSesseion").find("#authLive").off("click").on("click",
				function(e) {
					e.preventDefault();
					$.ajax({
						type : 'POST',
						async : false,
						url : '/cmcom/send-alive.json',
						data : {},
						dataType : "json",
						contentType : "application/json;charset=UTF-8",
						success : function(resultData) {
							util.loginTimeCheck.sessionPop.closeOutput();
						},
						complete : function(xhr, textStatus) {
							// 무조건 닫히도록 처리
							util.loginTimeCheck.sessionPop.closeOutput();
						}
					});
				});
		$("button.ui-close").off("click").on("click", function() {
			util.loginTimeCheck.isOpen = false;
		});
	}
	// 사용자인증시간 카운트다운
	,
	countDown : function() {
		util.loginTimeCheck.countTimer = setTimeout(
				function() {
					if (parseInt(util.loginTimeCheck.loginTime, 10) > (util.loginTimeCheck.timeoutSec - 1)) {
						gLoginCheck = false;
						util.loginTimeCheck.countEnd();
						location.href = "/util/login/auto-logout.do";
						return false;
					} else if (parseInt(util.loginTimeCheck.loginTime, 10) > (util.loginTimeCheck.timeoutWaringSec - 1)) {
						if (util.loginTimeCheck.isOpen) {
							util.loginTimeCheck.$authTimeLeft
									.html(util.loginTimeCheck.getTimeText());
							if ($("#uiPOPSesseion:visible").length === 0) {
								util.loginTimeCheck.sessionPop.openOutput();
							}
						}
					}
					util.loginTimeCheck.loginTime = parseInt(util.loginTimeCheck.loginTime) + 1;
					util.loginTimeCheck.countDown();
				}, 1000);
	},
	countEnd : function() {
		clearTimeout(util.loginTimeCheck.countTimer);
	}
};

/*******************************************************************************
 * 함 수 명 : getPagingHtml 함수설명 : 페이징 HTML 생성
 *
 * @param totalRows
 *            총 개수
 * @param rowSize
 *            페이지당 출력 개수
 * @param page
 *            현재 페이지
 * @param funcName
 *            페이징 처리 함수(optional)
 ******************************************************************************/
util.prototype.getPagingHtml = function(totalRows, rowSize, page, funcName) {
	totalRows = parseInt(totalRows, 10);
	rowSize = parseInt(rowSize, 10);
	page = parseInt(page, 10);
	if (totalRows === 0) {
		return "";
	}
	var html = [], totalPages = Math.ceil(totalRows / rowSize), pageBlock = Math
			.ceil(page / 10), startPage = ((pageBlock - 1) * 10) + 1;
	endPage = startPage + 10 - 1, beforePage = page - 1, nextPage = page + 1,
			imgFirst = '<img src="/images/com/icon_first.png" alt="처음페이지" />',
			imgPrev = '<img src="/images/com/icon_prev.png" alt="이전페이지" />',
			imgNext = '<img src="/images/com/icon_next.png" alt="다음페이지" />',
			imgLast = '<img src="/images/com/icon_last.png" alt="마지막페이지" />';

	if (!!!funcName) {
		funcName = "app.search";
	}
	if (beforePage === 0) {
		beforePage = 1;
	}
	if (nextPage > totalPages) {
		nextPage = page;
	}
	if (endPage > totalPages) {
		endPage = totalPages;
	}
	html.push('<a href="#" onclick="return ' + funcName + '(' + 1 + ')"'
			+ ' alt="처음페이지">' + imgFirst + '</a> ');
	html.push('<a href="#" onclick="return ' + funcName + '(' + beforePage
			+ ')"' + ' alt="이전페이지">' + imgPrev + '</a> ');
	html.push('<ul>');
	for (var i = startPage; i <= endPage; i++) {
		if (i == page) {
			html
					.push('<li class="on" ><a href="#"  onclick="return false;" alt="'
							+ i + '페이지">' + i + '</a></li>');
		} else {
			html.push('<li><a href="#" onclick="return ' + funcName + '(' + i
					+ ')" alt="' + i + '페이지">' + i + '</a></li>');
		}
	}
	html.push('</ul>');
	// html.push('<span class="mo_paging">');
	// html.push('<strong class="orange">' + page + '</strong> / ' + endPage);
	// html.push('</span>');
	html.push(' <a href="#" onclick="return ' + funcName + '(' + nextPage
			+ ')"' + ' alt="다음페이지">' + imgNext + '</a>');
	html.push(' <a href="#" onclick="return ' + funcName + '(' + totalPages
			+ ')"' + ' alt="마지막페이지">' + imgLast + '</a>');
	return html.join("");
};

util.prototype.data = {
	/*
	 * jsonGetVal : jsonData 에서 특정지어진 항목의 대응값을 가져옴(항목명에 속한 값을 모두 array 로 리턴) -
	 * Key 만 받는 경우 array 로 리턴 - Key, Value 받는 경우 데이터가 있으면 True, 없으면 False -
	 * Index 를 받는 경우 json 으로 리턴 jsonGetIndex : jsonData 에서 특정 index의 데이터를 모두 가져옴
	 * (항목:값 형태의 json data 로 리턴 getData : 전문통신을 통해서 공통성 데이터를 받아서 json항목에 셋팅
	 * getDataSelect : 전문통신을 통해서 공통성 데이터를 받아서 select 에 값을 셋팅 ArrayGetVal : array
	 * 에서 데이터 추출 - index 를 받는 경우 값 리턴 - 값을 받는 경우 index 를 리턴
	 *
	 * 서지혜 변경
	 */
	getData : function(callParam, callbackFunc) {
		var result = new Array();
		// Header 특별한 일이 없는 경우 빈 값
		var paramHeader = {};
		// Body
		var paramBody = {};
		// 복합코드 조회 여부 확인
		if (util.string.isEmpty(callParam.suboRelTpcd)) {
			paramBody = callParam;
			// util.loader.loaderShow = false; //백단 작업은 로딩바를 호출하지 않는다
			// 서비스를 호출
			bizCommon.ajaxJson("/common-code-list.json", paramBody, function(
					resultData) {
				var cnt = resultData.cdCnt1;
				for (var i = 0; i < cnt; i++) {
					result.push({
						"code" : resultData.detlCd1[i],
						"value" : resultData.detlCdNm1[i]
					});
				}
				// util.loader.loaderShow = true; //로딩바 호출
				callbackFunc.call(this, result);
			});
		} else {
			paramBody = callParam;
			// 서비스를 호출
			bizCommon.ajaxJson("/suborel-code-list.json", paramBody, function(
					resultData) {
				var cnt = resultData.dtcdct;
				for (var i = 0; i < cnt; i++) {
					result.push({
						"code" : resultData.dtcd[i],
						"value" : resultData.dtcnm[i]
					});
				}
				util.loader.loaderShow = true; // 로딩바 호출
				callbackFunc.call(this, result);
			});
		}
	},
	getbankChangeCode : function(clsfCd1, val) {
		var returnVal = "";
		if (clsfCd1 == "04391") {
			if (val == "79") {
				returnVal = "04";
			}
			if (val == "12" || val == "13" || val == "14" || val == "15"
					|| val == "16" || val == "17") {
				returnVal = "11";
			}
			if (val == "24" || val == "83") {
				returnVal = "20";
			}
			if (val == "21" || val == "88") {
				returnVal = "26";
			}
			if (val == "53") {
				returnVal = "27";
			}
			if (val == "46") {
				returnVal = "45";
			}
			if (val == "72" || val == "73" || val == "74" || val == "75") {
				returnVal = "71";
			}
			if (val == "80" || val == "82" || val == "05") {
				returnVal = "81";
			}
		}
		if (clsfCd1 == "04490") {
			if (val == "79" || val == "06") {
				returnVal = "04";
			}
			if (val == "09" || val == "12" || val == "13" || val == "14"
					|| val == "15" || val == "16" || val == "17") {
				returnVal = "11";
			}
			if (val == "24" || val == "83") {
				returnVal = "20";
			}
			if (val == "53") {
				returnVal = "27";
			}
			if (val == "46") {
				returnVal = "45";
			}
			if (val == "47" || val == "49") {
				returnVal = "48";
			}
			if (val == "72" || val == "73" || val == "74" || val == "75") {
				returnVal = "71";
			}
			if (val == "80" || val == "82" || val == "05") {
				returnVal = "81";
			}
			if (val == "21" || val == "26") {
				returnVal = "88";
			}
			if (val == "230") {
				returnVal = "238";
			}
			if (val == "268") {
				returnVal = "287";
			}
		}
		if (returnVal == "") {
			returnVal = val;
		}
		return returnVal;
	},
	getDataSelect : function(callParam, selectObject, defaultVal, callback) {
		var returnval = new Array();
		// Header 특별한 일이 없는 경우 빈 값
		var paramHeader = {};
		var cnt = 0;
		// Body
		var paramBody = {};

		// 현업요청 정지연 은행계좌 컨버팅 요청
		if (callParam.clsfCd1 + "" == "04391") {
			if (defaultVal.selectedVal + "" == "79") {
				defaultVal.selectedVal = "04";
			}
			if (defaultVal.selectedVal + "" == "12"
					|| defaultVal.selectedVal + "" == "13"
					|| defaultVal.selectedVal + "" == "14"
					|| defaultVal.selectedVal + "" == "15"
					|| defaultVal.selectedVal + "" == "16"
					|| defaultVal.selectedVal + "" == "17") {
				defaultVal.selectedVal = "11";
			}
			if (defaultVal.selectedVal + "" == "24"
					|| defaultVal.selectedVal + "" == "83") {
				defaultVal.selectedVal = "20";
			}
			if (defaultVal.selectedVal + "" == "21"
					|| defaultVal.selectedVal + "" == "88") {
				defaultVal.selectedVal = "26";
			}
			if (defaultVal.selectedVal + "" == "53") {
				defaultVal.selectedVal = "27";
			}
			if (defaultVal.selectedVal + "" == "46") {
				defaultVal.selectedVal = "45";
			}
			if (defaultVal.selectedVal + "" == "72"
					|| defaultVal.selectedVal + "" == "73"
					|| defaultVal.selectedVal + "" == "74"
					|| defaultVal.selectedVal + "" == "75") {
				defaultVal.selectedVal = "71";
			}
			if (defaultVal.selectedVal + "" == "80"
					|| defaultVal.selectedVal + "" == "82"
					|| defaultVal.selectedVal + "" == "05") {
				defaultVal.selectedVal = "81";
			}
		}
		if (callParam.clsfCd1 + "" == "04490") {
			if (defaultVal.selectedVal + "" == "06"
					|| defaultVal.selectedVal + "" == "79") {
				defaultVal.selectedVal = "04";
			}
			if (defaultVal.selectedVal + "" == "09"
					|| defaultVal.selectedVal + "" == "12"
					|| defaultVal.selectedVal + "" == "13"
					|| defaultVal.selectedVal + "" == "14"
					|| defaultVal.selectedVal + "" == "15"
					|| defaultVal.selectedVal + "" == "16"
					|| defaultVal.selectedVal + "" == "17") {
				defaultVal.selectedVal = "11";
			}
			if (defaultVal.selectedVal + "" == "24"
					|| defaultVal.selectedVal + "" == "83") {
				defaultVal.selectedVal = "20";
			}
			if (defaultVal.selectedVal + "" == "53") {
				defaultVal.selectedVal = "27";
			}
			if (defaultVal.selectedVal + "" == "46") {
				defaultVal.selectedVal = "45";
			}
			if (defaultVal.selectedVal + "" == "47"
					|| defaultVal.selectedVal + "" == "49") {
				defaultVal.selectedVal = "48";
			}
			if (defaultVal.selectedVal + "" == "72"
					|| defaultVal.selectedVal + "" == "73"
					|| defaultVal.selectedVal + "" == "74"
					|| defaultVal.selectedVal + "" == "75") {
				defaultVal.selectedVal = "71";
			}
			if (defaultVal.selectedVal + "" == "80"
					|| defaultVal.selectedVal + "" == "82"
					|| defaultVal.selectedVal + "" == "05") {
				defaultVal.selectedVal = "81";
			}
			if (defaultVal.selectedVal + "" == "21"
					|| defaultVal.selectedVal + "" == "26") {
				defaultVal.selectedVal = "88";
			}
			if (defaultVal.selectedVal + "" == "230") {
				defaultVal.selectedVal = "238";
			}
			if (defaultVal.selectedVal + "" == "268") {
				defaultVal.selectedVal = "287";
			}
		}

		// 분리작업 : 다른 코드의 경우 휴일검색이 불필요하므로 해당 코드만 휴일검색 후 코드 조회하는 것으로 수정 - 서지혜
		if (callParam.clsfCd1 + "" == "04391") {
			var paramBody = {
				"srhBzdyAdmDt" : util.date.today()
			};
			bizCommon.ajaxJson("/holiday-info.json", paramBody, function(
					resultData) {
				var bzdyTpcd = resultData.bzdyTpcd;// 0평일 1공휴일 2임시공휴일 4토요일 5일요일
													// 6연휴

				var paramBody = callParam;
				bizCommon.ajaxJson("/common-code-list.json", paramBody,
						function(resultData) {
							cnt = resultData.cdCnt1;
							for (var i = 0; i < parseInt(cnt); i++) {
								if (resultData.detlCd1[i] == "45") {// 새마을금고
																	// 일/토/공휴일
																	// 제외
									if (bzdyTpcd == "0") {
										returnval.push({
											"code" : resultData.detlCd1[i],
											"value" : resultData.detlCdNm1[i]
										});
									}
								} else if (resultData.detlCd1[i] == "03") {// 기업은행
																			// 일/공휴일
																			// 제외
									if (bzdyTpcd == "0" || bzdyTpcd == "4") {
										returnval.push({
											"code" : resultData.detlCd1[i],
											"value" : resultData.detlCdNm1[i]
										});
									}
								} else {
									returnval.push({
										"code" : resultData.detlCd1[i],
										"value" : resultData.detlCdNm1[i]
									});
								}
							}
							util.form.selectSetJsonArray(selectObject,
									returnval, defaultVal, callback);
						});
			});
		} else {

			if (util.string.isEmpty(callParam.suboRelTpcd)) {
				var valueMode = callParam.valueMode;

				paramBody = callParam;
				paramBody.valueMode = null;

				// 서비스를 호출
				bizCommon.ajaxJson("/common-code-list.json", paramBody,
						function(resultData) {
							cnt = resultData.cdCnt1;
							for (var i = 0; i < parseInt(cnt); i++) {
								if (callParam.clsfCd1 + "" == "01696") {
									if (resultData.detlCd1[i] + "" != "00") {
										returnval.push({
											"code" : resultData.detlCd1[i],
											"value" : resultData.detlCdNm1[i]
										});
									}
								} else if (valueMode == "value") {
									returnval.push({
										"code" : resultData.detlCdNm1[i],
										"value" : resultData.detlCdNm1[i]
									});
								} else if (valueMode == "code") {
									returnval.push({
										"code" : resultData.detlCd1[i],
										"value" : resultData.detlCd1[i]
									});
								} else {
									returnval.push({
										"code" : resultData.detlCd1[i],
										"value" : resultData.detlCdNm1[i]
									});
								}
							}
							util.form.selectSetJsonArray(selectObject,
									returnval, defaultVal, callback);
						});

			} else {
				paramBody = callParam;
				// 서비스를 호출
				bizCommon.ajaxJson("/suborel-code-list.json", paramBody,
						function(resultData) {
							var cnt = resultData.dtcdct;
							for (var i = 0; i < parseInt(cnt); i++) {
								returnval.push({
									"code" : resultData.dtcd[i],
									"value" : resultData.dtcnm[i]
								});
							}
							util.form.selectSetJsonArray(selectObject,
									returnval, defaultVal);
						});
			}
		}
	},
	jsonGetVal : function(jsonObject, keyname) {
		// jsonObject 에서 루프를 돌면서 key 에 대응하는 value 를 리턴.
		var retVal = "";
		$.each(jsonObject, function(key, value) {
			if (key == keyname) {
				retVal = value;
			}
		});
		return retVal;
	},
	getCodeValue : function(arrayObject, codeValue) {
		// jsonObject 에서 루프를 돌면서 key 에 대응하는 value 를 리턴.
		var retVal = "";
		var arrLength = arrayObject.length;
		for (var i = 0; i < arrLength; i++) {
			if (arrayObject[i].code == codeValue) {
				retVal = arrayObject[i].value;
			}
			;
		}
		;
		if (retVal == "") {
			retVal = codeValue;
		}
		return retVal;
	},
	clearJson : function(jsonObject) {
		var retVal = {};
		$.each(jsonObject, function(key, value) {
			/*
			 * value : string / array / function / object (json , xml) / number
			 *
			 */
			eval("retVal." + key + " = '' ");
		});
		return retVal;
	}
};

util.prototype.print = {
	printPopupParam : {} // util.print.printPopupParam 에서 사용될 개체
	,
	printParam : {} // util.print.print 에서 사용될 개체
	/***************************************************************************
	 * 함 수 명 : printPopup 함수설명 : 증명서 발급 팝업 호출
	 **************************************************************************/
	,
	printPopup : function(oParam) {
		util.print.printPopupParam = {};
		util.print.printPopupParam = oParam;

		for (var i = 0; i < oParam.odiParamName.length; i++) {
			if (oParam.odiParamName[i] == "inqPlyno") {
				Cookies.set("inqPlyno", oParam.odiParamValue[i]);
			}
		}
		Cookies.set("printId", oParam.printId);


		if( !util.info.isLogin() ) {
			if(confirm('로그인 후 이용 가능한 서비스입니다. 로그인하시겠습니까?')) {
				location.href = "/util/login/login.do";
			} else {
				return;
			}
		}else{
			open("/popup/pop-common-prnot.do", "",
			"width=800,height=700,scrollbars=no,left=100,top=50,menubar=no,toolbar=no");
		}
	}
	/***************************************************************************
	 * 함 수 명 : printIframe 함수설명 : 증명서 발급 iframe 호출
	 **************************************************************************/
	,
	printIframe : function(oParam) {
		util.print.printPopupParam = {};
		util.print.printPopupParam = oParam;

		for (var i = 0; i < oParam.odiParamName.length; i++) {
			if (oParam.odiParamName[i] == "inqPlyno") {
				Cookies.set("inqPlyno", oParam.odiParamValue[i]);
			}
		}
		Cookies.set("printId", oParam.printId);

		$("#prtFrame").attr("src", "/popup/pop-common-prnot.do");
	}

	/***********************************************************************************************************
	* 함 수 명	:	certiReisPdfDownload
	* 사용서비스	:	transComZ030PB
	* 함수설명	:	증명서 pdf 파일 다운로드 전문 호출 - 증명서 발급 전용으로 사용
	***********************************************************************************************************/
	,certiReisPdfDownload : function(oParam) {

		var cnnPlynoOrLnno = new Array();
		var pValue = "", enc_param = "", no_param = "", prnotPmtrStr = "";
		var remComa = "N";

		prnotPmtrStr += "{";

		for (var i = 0; i < oParam.odiParamName.length;i++) {

			if ("inqPlyno"== oParam.odiParamName[i]) { // ltrH070용
				cnnPlynoOrLnno.push(oParam.odiParamValue[i]);
			}

			pValue = oParam.odiParamName[i] + "=" + oParam.odiParamValue[i];

			if (i == 0) {
				prnotPmtrStr += "\"" + oParam.odiParamName[i] + "\" : \"" + oParam.odiParamValue[i] + "\"";
			} else {
				prnotPmtrStr += ", \"" + oParam.odiParamName[i] + "\" : \"" + oParam.odiParamValue[i] + "\"";
			}

			if (i == 0) {
				enc_param = pValue;
			} else if (i < 3) {
				enc_param += " / " + pValue;
			} else if (i == 3) {
				no_param = pValue;
			} else {
				no_param += " / " + pValue;
			}
		}

		prnotPmtrStr += "}";

		enc_param += " / ";

		var u = location.pathname.split("/");
		var screenId = u[u.length - 1];

		var paramBody = {
			  "prontPmtr"	: "[" + prnotPmtrStr + "]"	// 출력물파라미터
			, "screenId"	: screenId
		};

		var FilePath = "";
		var SaveIp = "";

		bizCommon.ajaxJson("/fplaza/proof/certiReisPdfDownload.json", paramBody, function(resultData) {

			if(typeof resultData.answCode !="undefined" && resultData.answCode == "ERRI0000") {

				alert(resultData.answBasc);

			} else if (resultData.ansMsg[0] == "true") {

				/******************************************************************************************************
				 * NAME : FILE DOWNLOAD 기능
				 * ***************************************************************************************************/

				var postData = {};

				$.ajax({
					type : "POST"
					, url : "/downloadFilePdf.json"
					, data : JSON.stringify( postData )
					, contentType : "application/json;charset=utf-8"
					, dataType : "json"
					, success : function(data) {
						if ( data.retCd == "SUCCESS" ) {

							var iframe = document.createElement('iframe');
							iframe.id = "filedownload";
							iframe.style.display = 'none';
							document.body.appendChild(iframe);
							iframe.src = "/fileDownloadAndViiew.json";

						} else if ( data.retCd == "FAIL" ) {
							alert("PDF 파일 다운로드 중 오류가 발생했습니다.");
							return;
						}
					}
				});

				if (oParam.printId == "LTRH070") { //장기보험발송이력처리
					var paramBody2 = {
						  "cnnPlynoOrLnno"		: cnnPlynoOrLnno		//관련증권/대출번호
						, "trmIp"				: "||ip||"				//IP
					};

					bizCommon.ajaxJson("/fplaza/proof/send-hist-req.json", paramBody2, function(resultData) {});
				}

				$.ajax({
					type :"POST"
					,async : false
					,url : "/cmcom/insert-print-log.json"
					,data: {
					  	"cnoTpcd"			: "MOBLWEB"		//접속유형코드 [ 기존 : HMPAG -> MOBLWEB(모바일) ]
					    , "tlmcd"				: oParam.printId		//전문코드
					    , "tlmAnscdXpnm"	: "PDF 다운로드"		//전문응답코드설명
					    , "inpUsrTpcd"		: "01"					//입력사용자유형코드
					    , "inpUsrBjno"		: "00"					//입력사용자대상번호
					    , "inpUsrId"			: "SYSTEM"			//입력사용자ID
					    , "mdfUsrId"			: "SYSTEM"			//수정사용자ID
					    , "encParam"			: enc_param			//암호화파라미터
					    , "param"				: no_param			//파라미터
					}
					,dataType :"json"
					,success : function(data, textStatus, jqXHR) {
					}
				});

				alert("PDF 파일 다운로드가 완료되었습니다.");
			} else {
				alert("PDF 파일 다운로드를 실패하였습니다.");
				location.reload();
			}
		});
	}

	/***************************************************************************
	 * 함 수 명 : print 함수설명 : 인쇄 팝업 호출
	 **************************************************************************/
	,
	print : function(oParam) {
		util.print.printParam = {};
		util.print.printParam = oParam;
		open("/popup/pop-print.do", "",
				"width=1000,height=700,scrollbars=yes,left=100,top=50,menubar=no,toolbar=no");
	}
	/***************************************************************************
	 * 함 수 명 : certiReisSendEmail - 서지혜 사용서비스 : transComZ030PC 함수설명 : 증명서 이메일 발송
	 * 전문 호출 - 증명서 발급 전용으로 사용
	 **************************************************************************/
	,
	certiReisSendEmail : function(oParam) {

		var email = $("#txt_email_id").val() + "@"
				+ $("#txt_email_domain").val();
		var cnnPlynoOrLnno = new Array();
		if (!util.validate.isEmail(email)) {
			alert("이메일을 바르게 입력하세요.");
			return;
		}

		var pValue = "", enc_param = "", no_param = "", prnotPmtrStr = "";
		var remComa = "N";

		prnotPmtrStr += "{";

		for (var i = 0; i < oParam.odiParamName.length; i++) {

			if (oParam.odiParamName[i] == "inqPlyno") { // ltrH070용
				cnnPlynoOrLnno.push(oParam.odiParamValue[i]);
			}

			pValue = oParam.odiParamName[i] + "=" + oParam.odiParamValue[i];

			if (i == 0) {
				prnotPmtrStr += "\"" + oParam.odiParamName[i] + "\" : \""
						+ oParam.odiParamValue[i] + "\"";
			} else {
				if (oParam.odiParamName[i] != "emailSecuPw") {
					if (remComa == "Y") {
						prnotPmtrStr += "\"" + oParam.odiParamName[i]
								+ "\" : \"" + oParam.odiParamValue[i] + "\"";
						remComa = "N";
					} else {
						prnotPmtrStr += ", \"" + oParam.odiParamName[i]
								+ "\" : \"" + oParam.odiParamValue[i] + "\"";
					}
				} else {
					remComa = "Y";
					prnotPmtrStr += ", \"" + oParam.odiParamName[i] + "\" : \""
							+ oParam.odiParamValue[i] + "\"";
					if (i < oParam.odiParamName.length - 1) {
						prnotPmtrStr += "}, {";
					}
				}
			}

			if (i == 0) {
				enc_param = pValue;
			} else if (i < 3) {
				enc_param += " / " + pValue;
			} else if (i == 3) {
				no_param = pValue;
			} else {
				no_param += " / " + pValue;
			}
		}

		prnotPmtrStr += "}";

		enc_param += " / " + email;

		var mailTitle = "한화손해보험에서 " + oParam.printName + "을(를) 보내드립니다.", mailContent = "";

		email = jQuery.base64.encode(email);

		var voNm = oParam.ifVal;

		var u = location.pathname.split("/");
		var screenId = u[u.length - 1];

		var paramBody = {
			"prnotId" : oParam.printId // 출력물ID
			,
			"prnotNm" : oParam.prnotNm // 출력물명
			,
			"voNm" : voNm // printId와 vo명이 다른경우에 입력한다.
			,
			"prnotPmtr" : "[" + prnotPmtrStr + "]" // 출력물파라미터
			,
			"rcvptMail" : email // 수신자메일
			,
			"type" : "S",
			"screenId" : screenId
		};

		bizCommon.ajaxJson("/fplaza/proof/certiReisSendEmail.json", paramBody,
				function(resultData) {

					if (resultData.ansRst == "true") {

						if (oParam.printId == "LTRH070") { // 장기보험발송이력처리
							var paramBody2 = {
								"rqdt" : util.date.today() // 신청일자
								,
								"rqdtHms" : util.date.nowTime() // 신청일시
								,
								"onlRqYn" : "1" // 온라인신청여부
								,
								"prnotItmcd" : "12020160004" // 출력물품목코드?
								,
								"outMdmFlgCd" : "02" // 출력물매체구분코드 02이메일
								,
								"prnotTrnmMtdCd" : "05" // 풀력물전달방법코드 05이메일
								,
								"rpubYn" : "1" // 재발행여부
								,
								"listCnt" : 1,
								"cnnPlynoOrLnno" : cnnPlynoOrLnno // 관련증권/대출번호
								,
								"isStfNo" : "8914327" // 발급직원번호
								,
								"isCasFlgcd" : "04" // 발급원인구분코드
								,
								"outPthFlgcd" : "03" // 출력경로구분코드
								,
								"isFlgCd" : "03" // 발급구분코드
								,
								"trmIp" : "||ip||" // IP
								,
								"isdt" : util.date.today(),
								"type" : "R",
								"screenId" : screenId
							};

							bizCommon.ajaxJson(
									"/fplaza/proof/certiReisSendEmail.json",
									paramBody2, function(resultData) {
									});
						}

						$.ajax({
							type : "POST",
							async : false,
							url : "/cmcom/insert-print-log.json",
							data : {
								"cnoTpcd" : "HMPAG"// 접속유형코드
								,
								"tlmcd" : oParam.printId// 전문코드
								,
								"tlmAnscdXpnm" : "발급물 메일발송"// 전문응답코드설명
								,
								"inpUsrTpcd" : "01"// 입력사용자유형코드
								,
								"inpUsrBjno" : "00"// 입력사용자대상번호
								,
								"inpUsrId" : "SYSTEM"// 입력사용자ID
								,
								"mdfUsrId" : "SYSTEM"// 수정사용자ID
								,
								"encParam" : enc_param// 암호화파라미터
								,
								"param" : no_param
							// 파라미터
							},
							dataType : "json",
							success : function(data, textStatus, jqXHR) {
								util.loader.end();
							}
						});
						alert("이메일 발송이 완료되었습니다.");
						location.reload();
					} else {
						alert("이메일 발송이 실패하였습니다.");
						location.reload();
					}
				});
	}

};

util.prototype.info = {
	/***************************************************************************
	 * 함 수 명 : getEncUserInfo 함수설명 :
	 **************************************************************************/
	getEncUserInfo : function(gubun, type) {
		if (!gubun)
			gubun = "";
		if (!type)
			type = "";
		var rtn = "";
		$.ajax({
			type : "POST",
			async : false,
			url : "/cmcom/get-enc-user-info.json",
			data : {
				"gubun" : gubun,
				"type" : type
			},
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				rtn = data;
			},
			error : function(data, textStatus, jqXHR) {
				rtn = "";
			}
		});
		return rtn;
	}
	/***************************************************************************
	 * 함 수 명 : isLogin 함수설명 : 현시점 로그인 여부 반환
	 **************************************************************************/
	,
	isLogin : function(gubun) {
		var rtn = false;
		$.ajax({
			type : "POST",
			async : false,
			url : "/cmcom/get-is-login.json",
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				if (data == "Y") {
					rtn = true;
				}
			}
		});
		return rtn;
	}
	/***************************************************************************
	 * 함 수 명 : getServerTime 함수설명 : 현시점 서버시간 반환
	 **************************************************************************/
	,
	getServerTime : function(gubun) {
		if (!gubun)
			gubun = "yyyy-MM-dd HH:mm:ss.SSS";
		var rtn = "";
		$.ajax({
			type : "POST",
			async : false,
			url : "/cmcom/get-server-time.json",
			data : {
				"gubun" : gubun
			},
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				rtn = data;
			}
		});
		return rtn;
	}
	/***************************************************************************
	 * 함 수 명 : isHoliday 함수설명 : 공휴일 체크 ***휴일일때 true 반환***
	 **************************************************************************/
	,
	isHoliday : function(day) {
		if (!day)
			day = util.info.getServerTime("yyyyMMdd");
		var flag = false;
		var paramBody = {
			"srhBzdyAdmDt" : day
		};
		var u = location.pathname.split("/");
		u = u[u.length - 1];
		bizCommon.ajaxJson("/holiday-info.json", paramBody,
				function(resultData) {
					var bodyData = resultData;
					var answCode = resultData.answCode;
					if (answCode.substring(3, 4) == "I") {
						if (bodyData.bzdyTpcd != "0") {
							flag = true;
						}
					}
				}, null, false);
		return flag;
	}
	/***************************************************************************
	 * 함 수 명 : sysCheck 함수설명 : 로컬,개발,운영 구분자 반환 local, test, real
	 **************************************************************************/
	,
	sysCheck : function() {
		var rtn = "";
		$.ajax({
			type : "POST",
			async : false,
			url : "/cmcom/sys-check.json",
			data : {},
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				rtn = data;
			}
		});
		return rtn;
	}
	/***************************************************************************
	 * 함 수 명 : getUserIp 함수설명 : 사용자 IP주소
	 **************************************************************************/
	,
	getUserIp : function() {
		var rtn = "";
		$.ajax({
			type : "POST",
			async : false,
			url : "/cmcom/sys-check.json",
			data : {},
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				rtn = data;
			}
		});
		return rtn;
	}
	/***************************************************************************
	 * 함 수 명 : isOwnPrd 함수설명 : 해당 보험에 가입되어 있는지 체크
	 **************************************************************************/
	,
	isOwnPrd : function(p, callback) {
		var flag = false;
		$.ajax({
			method : "POST",
			url : "/product/catalog/is-own-products.json", // 내부에서 상품 정보를 같이
															// 조회는 것으로 수정 서지혜
			data : {
				"insGdcd" : p
			},
			dataType : "json"
		}).done(function(resultData) {
			flag = resultData.isOwn;
			if (callback)
				callback(flag);
		}).fail(function(jqXHR, textStatus) {
			util.alert("xhr : " + jqXHR + ", textStatus : " + textStatus);
		});
	}
	/***************************************************************************
	 * 함 수 명 : getRangeAge 함수설명 : 보험범위및연령 텍스트 값 반환 gubun - r : 범위값, a : 연령값, rl :
	 * 범위전체, al : 연령전체
	 **************************************************************************/
	,
	getRangeAge : function(gubun, code) {
		var rtnResult = null;
		var rangeInfo = { // CCA00010
			"04" : "본인",
			"13" : "본인 + 지정1인",
			"02" : "부부한정",
			"16" : "부부 + 자녀",
			"17" : "본인 + 자녀",
			"11" : "부부 + 지정1인",
			"03" : "가족 + 형제자매",
			"01" : "가족(형제자매 제외)",
			"05" : "가족 + 지정1인",
			"00" : "누구나 운전"
		}
		var ageInfo = { // CCA00009
			"00" : "전연령",
			"21" : "만21세이상",
			"22" : "만22세이상",
			"24" : "만24세이상",
			"26" : "만26세이상",
			"28" : "만28세이상",
			"30" : "만30세이상",
			"35" : "만35세이상",
			"43" : "만43세이상",
			"48" : "만48세이상",
			"3355" : "만33세~만55세",
			"4865" : "만48세~만65세"
		}
		if (gubun == "r") {
			rtnResult = rangeInfo[code];
		} else if (gubun == "a") {
			rtnResult = ageInfo[code];
		} else if (gubun == "rl") {
			rtnResult = rangeInfo;
		} else if (gubun == "al") {
			rtnResult = ageInfo;
		}
		return rtnResult;
	}
};

util.prototype.popup = {
	openWinPopup2 : function(width, height, title, link, parm, secure) {
		var pattern = /[^\uAC00-\uD7A3xfe0-9a-zA-Z\\s]/gi;
		title = title.replace(pattern, ""); // 타이틀에 공백이 들어가면 오류 발생 공백 제거
		if (secure == "Y") {
			// 암호화 팝업 전송
			var myWin = window.open("", title, "width=" + width + ",height="
					+ height
					+ ",scrollbars=yes,left=100,top=50,menubar=no,toolbar=no");
			var f = document.sendForm_hw;
			var objs, value;
			for ( var key in parm) {
				value = parm[key];
				if (value == null || typeof (value) == "undefined") {
					continue;
				}
				if (value.constructor == Array) {
					for (var i = 0; i < value.length; i++) {
						objs = document.createElement('input');
						objs.setAttribute('type', 'hidden');
						objs.setAttribute('name', key);
						objs.setAttribute('value', value[i]);
						f.appendChild(objs);
					}
				} else {
					objs = document.createElement('input');
					objs.setAttribute('type', 'hidden');
					objs.setAttribute('name', key);
					objs.setAttribute('value', value);
					f.appendChild(objs);
				}
			}
			// 이니텍 암호화 된 값이 들어갈 필드 추가 (한개의 폼을 이용한 데이터 전송 이용)
			/*
			 * objs = document.createElement('input'); objs.setAttribute('type',
			 * 'hidden'); objs.setAttribute('name', "INIpluginData");
			 * objs.setAttribute('value', ""); f.appendChild(objs);
			 */
			f.setAttribute('target', title);
			f.setAttribute('method', 'post');
			f.setAttribute('action', link);
			// document.body.appendChild(f);
			if (EncForm(f)) { // 이니텍 암호화 전송 함수 호출부분
				// 암호화 성공
				f.submit();
			} else {
				alert("입력항목의 암호화에 실패했습니다.");
			}
			f.innerHTML = "";
			objs = document.createElement('input');
			objs.setAttribute('type', 'hidden');
			objs.setAttribute('name', "INIpluginData");
			objs.setAttribute('value', "");
			f.appendChild(objs);
		} else {
			var myWin = "";
			if (secure == "C") { // 전자민원접수시.2013.02.20 유다성
				myWin = window
						.open(
								"",
								title,
								"width="
										+ width
										+ ",height="
										+ height
										+ ",scrollbars=no,left=100,top=50,menubar=no,toolbar=no");
			} else {
				myWin = window
						.open(
								"",
								title,
								"width="
										+ width
										+ ",height="
										+ height
										+ ",scrollbars=yes,left=100,top=50,menubar=no,toolbar=no");
			}

			var f = document.sendForm_hw;
			var objs, value;
			for ( var key in parm) {
				value = parm[key];
				if (value == null || typeof (value) == "undefined") {
					continue;
				}
				if (value.constructor == Array) {
					for (var i = 0; i < value.length; i++) {
						objs = document.createElement('input');
						objs.setAttribute('type', 'hidden');
						objs.setAttribute('name', key);
						objs.setAttribute('value', value[i]);
						f.appendChild(objs);
					}
				} else {
					objs = document.createElement('input');
					objs.setAttribute('type', 'hidden');
					objs.setAttribute('name', key);
					objs.setAttribute('value', value);
					f.appendChild(objs);
				}
			}
			f.setAttribute('target', title);
			f.setAttribute('method', 'post');
			f.setAttribute('action', link);
			// document.body.appendChild(f);
			f.submit();
			f.innerHTML = "";
			objs = document.createElement('input');
			objs.setAttribute('type', 'hidden');
			objs.setAttribute('name', "INIpluginData");
			objs.setAttribute('value', "");
			f.appendChild(objs);
		}
	},
	consultParam : {} // util.popup.goConsult2 에서 사용될 객체
	,
	goConsult2 : function(bojongCode, bojongNm, contents, type) {
		util.popup.consultParam = {
			"bojongCode" : bojongCode,
			"conSultType" : bojongNm,
			"contents" : contents
		};
		if (type === "3") {// 스마트보장분석//개인영업FP
			open("/popup/pop-counsel-fp.do", "상담신청",
					"width=880px,height=700px,scrollbars=yes,menubar=no,toolbar=no");
		} else if (type === "4") {// 이지보장분석
			open("/popup/pop-counsel-slc.do", "상담신청",
					"width=880px,height=700px,scrollbars=yes,menubar=no,toolbar=no");
		} else if (type === "9") {// 개인정보열람신청
			if( !util.info.isLogin() ) {
				if(confirm('로그인 후 이용 가능한 서비스입니다. 로그인하시겠습니까?')) {
					location.href = "/util/login/login.do";
				} else {
					return;
				}
			}else{
				open("/popup/pop-counsel-personal.do", "개인정보열람요청",
				"width=880px,height=700px,scrollbars=yes,menubar=no,toolbar=no");
			}
		} else if (type === "10") {// 컨설턴트 지원
			open("/popup/pop-counsel-introfp.do", "컨설턴트 지원",
					"width=880px,height=700px,scrollbars=yes,menubar=no,toolbar=no");
		} else {// 2 자동차 상담신청 - 신채널TM //
			open("/popup/pop-counsel-tm.do", "상담신청",
					"width=880px,height=700px,scrollbars=yes,menubar=no,toolbar=no");
		}
	},
	errorParam : {} // util.popup.errorPopup 에서 사용될 객체
	,
	errorPopup : function(code, header) {
		util.popup.errorParam = {
			"code" : code,
			"answCode" : (header) ? header.answCode : '',
			"answBasc" : (header) ? header.answBasc : ''
		};
		var system_pop = $plugin.popmodal($('#uiPOPSystem'), {
			load_display : true,
			callback_before : function() {
				return true
			}
		});
		$("#uiPOPSystem")
				.find("#counselBtn")
				.off("click")
				.on(
						"click",
						function(e) {
							e.preventDefault();
							open("/popup/pop-error-log.do", "상담신청",
									"width=880px,height=700px,scrollbars=yes,menubar=no,toolbar=no");
						});
	},
	excelPopUp : function(printObject, printTitle) {
		var popData = printObject.html();
		var param = {
			"printData" : popData,
			"printTitle" : printTitle
		};
		util.popup
				.openWinPopup2("800px", "600px", "excel", "/excel.jsp", param);
	},
	payParam : {},
	goPay : function(param) {
		util.popup.payParam = param;
		if( !util.info.isLogin() ) {
			if(confirm('로그인 후 이용 가능한 서비스입니다. 로그인하시겠습니까?')) {
				location.href = "/util/login/login.do";
			} else {
				return;
			}
		}else{
			open("/fplaza/compensation/pop-result02.do", "지급내역조회",
			"width=880px,height=800px,scrollbars=yes,menubar=no,toolbar=no");
		}
	},
	normalPopUp : function(width, height, url, target, obj) {
		window.open("", target, "width=" + width + ",height=" + height
				+ ",scrollbars=yes");
		obj.attr('action', url);
		obj.submit();

	},
	status : false,
	callbackfunc : null,
	openPopup : function(width, height, link, param00, callback) {
		var pWidth = $(document).width();
		var pHeight = $(document).height();
		var param = param00;
		var popup = $("<div id='hiddenPopup'><div class='popupBack'></div><div class='popupContentDiv'></div></div>");
		$("html").css({
			overflow : 'hidden'
		});
		util.popup.status = true;
		popup.find(".popupContentDiv").load(
				(link),
				function() {
					var scriptUrl1 = link.replace(".jsp", ".js");
					var scriptUrl1_1 = scriptUrl1.substring(scriptUrl1
							.lastIndexOf("/"));
					var scriptId = scriptUrl1_1.replace(".jsp", "").replace(
							"/", "")
							+ "_script";
					var scriptStr = document.createElement("script");
					scriptStr.type = "text/javascript";
					scriptStr.src = scriptUrl1;
					document.body.appendChild(scriptStr);
					var sumTop = ($(window).height() - $("#popup>div:eq(1)")
							.height()) / 2;
					$(this).css({
						width : pWidth,
						position : "absolute",
						zIndex : "1000",
						left : "0",
						top : ($(document).scrollTop() + sumTop)
					});
					$('.pop_close').click(function() {
						util.popup.closePopup();
						$("html").css({
							overflow : 'auto'
						});
						return false;
					});
					if (callback) {
						util.popup.callbackfunc = callback;
					}
					$("html").css({
						overflow : 'hidden'
					});
					$("#popup>div:eq(1)").attr({
						tabindex : 0
					}).focus();
					try {
						popInit(param);
					} catch (e) {
						return false;
					}
				});
	}
	/***************************************************************************
	 * 함 수 명 : openLayer 함수설명 : 레이어삽입
	 **************************************************************************/
	,
	openLayer : function(divArea, url, param) {
		$.ajax({
			type : "POST",
			dataType : "html",
			url : url,
			data : param,
			async : false,
			success : function(html) {
				$("#" + divArea).empty().append(html);
			}
		});
	}
	/***************************************************************************
	 * 함 수 명 : openWindow 함수설명 : 팝업호출 winUrl 새창 url 컨트롤러에 전달하고 싶은 파라미터는 ?& 로 추가
	 * winName 새창 이름 winWidth 창 넓이 winHeight 창 높이 winParam 새창에서 참조할 파라미터(컨트롤러에서
	 * 사용 필요하면 winUrl 에 ?&로 추가) winScroll 스크롤 여부 (yes|no) winResize 리사이즈 여부
	 * (yes|no) winLeft 창 좌측 위치 값이 없으면 해상도 가로값 winTop 창 탑 위치 값이 없다면 해상도 세로값
	 **************************************************************************/
	,
	openWindow : function(winUrl, winName, winWidth, winHeight, winParam,
			winScroll, winResize, winLeft, winTop) {
		if (winScroll == null || typeof (winScroll) == "undefined")
			winScroll = "no";
		if (winResize == null || typeof (winResize) == "undefined")
			winResize = "no";
		if (winLeft == null || typeof (winLeft) == "undefined")
			winLeft = parseInt((window.screen.width - parseInt(winWidth)) / 2,
					10);
		if (winTop == null || typeof (winTop) == "undefined")
			winTop = parseInt((window.screen.height - parseInt(winHeight)) / 2,
					10);

		util.popup.openWindowParam = {};
		util.popup.openWindowParam = winParam;
		var newWin = window.open(winUrl, winName, "width=" + winWidth
				+ ",height=" + winHeight + ",scrollbars=" + winScroll
				+ ",resizable=" + winResize + ",left=" + winLeft + ",top="
				+ winTop + ",directories=no,status=no,menubar=no,location=no");
		if (newWin) {
			newWin.focus();
			return newWin;
		}
	},
	openWindowParam : {}
};

/*******************************************************************************
 * 함 수 명 : hpAuth 함수설명 : 휴대폰 인증 팝업 호출
 ******************************************************************************/
util.prototype.hpAuth = {
	hpAuthParam : {},
	pop : function(p, f) {
		util.hpAuth.hpAuthParam = {};
		util.hpAuth.hpAuthParam = p;
		var url = "";
		if (!f) {
			if( !util.info.isLogin() ) {
				if(confirm('로그인 후 이용 가능한 서비스입니다. 로그인하시겠습니까?')) {
					location.href = "/util/login/login.do";
				} else {
					return;
				}
			}else{
				url = "/popup/pop-cellphone-auth02.do";
				window
				.open(
						url,
						"auth02",
						"width=548,height=560,scrollbars=yes,left=100,top=50,resizable=no,menubar=no,toolbar=no,location=no,directories=no,status=no");
			}
		}else{
			url = "/popup/pop-cellphone-auth01.do";
			window
			.open(
					url,
					"auth02",
					"width=548,height=560,scrollbars=yes,left=100,top=50,resizable=no,menubar=no,toolbar=no,location=no,directories=no,status=no");
		}
	}
};

util.prototype.file = {
	/***************************************************************************
	 * 함 수 명 : sendEdms 함수설명 : 서버에 저장된 파일을 edms로 전송
	 **************************************************************************/
	sendEdms : function(uploadID, work) {

		var fInfo = DEXT5UPLOAD.GetNewUploadListForText(uploadID), arrData = new Array(), fObj = new Object(), returnData;
		var fArr = fInfo.split('\u000B');
		for (var i = 0; i < fArr.length; i++) {
			var f = fArr[i].split('\u000C');
			var chk_pdf = false;
			if (f[10] != "") {
				chk_pdf = true;
				var fjpg = f[10].split('_');
				var fcnt = parseInt(fjpg[1], 10);
				for (var z = 0; z < fcnt; z++) {
					var num_val = "";
					if (z < 10)
						num_val = "_000" + z;
					if (z > 9 && z < 100)
						num_val = "_00" + z;
					if (z > 99 && z < 1000)
						num_val = "_0" + z;
					if (z > 999)
						num_val = "_" + z;

					fObjjpg = new Object();
					fObjjpg.originalFilename = fjpg[0] + num_val + ".jpg";
					fObjjpg.size = '100';
					fObjjpg.contentType = "jpg";
					fObjjpg.uploadFileName = fjpg[0] + num_val + ".jpg";
					fObjjpg.saveFilename = fjpg[0] + num_val + ".jpg";
					arrData.push(fObjjpg);
				}
			}
			if (!(f[7] == "pdf" && chk_pdf)) {
				fObj = new Object();
				fObj.originalFilename = f[0];
				fObj.size = f[2];
				fObj.contentType = f[7];
				fObj.uploadFileName = f[0];
				fObj.saveFilename = f[1];
				arrData.push(fObj);
			}

		}

		$.ajax({
			type : "POST",
			async : false,
			url : "/file/" + work + "/send-edms.json",
			data : JSON.stringify(arrData),
			dataType : "json",
			contentType : "application/json",
			success : function(data, textStatus, jqXHR) {
				returnData = data;
			}
		});
		return returnData;
	}
	/***************************************************************************
	 * 함 수 명 : deleteFiles 함수설명 : 서버에 저장된 파일 삭제
	 **************************************************************************/
	,
	deleteFiles : function(files) {
		var returnData = "";
		$.ajax({
			type : "POST",
			async : false,
			url : "/file/delete-file.json",
			data : JSON.stringify(files),
			dataType : "json",
			contentType : "application/json",
			success : function(data, textStatus, jqXHR) {
				returnData = data;
			}
		});
		return returnData;
	}
	/***************************************************************************
	 * 함 수 명 : getEdmsFiles 함수설명 : Edms에 저장된 파일을 서버로 다운로드 한다.
	 **************************************************************************/
	,
	getEdmsFiles : function(work, arrFileIds, arrFileNames) {
		var returnData = "";
		$.ajax({
			type : "POST",
			async : false,
			url : "/file/" + work + "/download-edms-file.json",
			data : {
				"arrFileIds" : arrFileIds,
				"arrFileNames" : arrFileNames
			},
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				returnData = data;
			}
		});
		return returnData;
	}
	/***************************************************************************
	 * 함 수 명 : getFileInfo 함수설명 : Edms로 부터 내려받은 파일 정보
	 **************************************************************************/
	,
	getFileInfo : function(data) {
		var rtnFile = [];
		var fileNames = data.result.arrFileNames;
		var fileKeys = data.result.arrFileIds;
		for ( var i in fileNames) {
			rtnFile.push({
				"fileName" : fileNames[i],
				"fileKey" : fileKeys[i]
			});
		}
		return rtnFile;
	}
	/***************************************************************************
	 * 함 수 명 : fileDownload 함수설명 : 파일 다운로드
	 **************************************************************************/
	,
	fileDownload : function(work, fileName) {
		var ifr = $("<iframe src='/file/"
				+ work
				+ "/download-file.do?fileName="
				+ fileName
				+ "' width='0' height='0' style='display:none;' title='빈 프레임' />");
		$('body').append(ifr);
	}
};

/*******************************************************************************
 * 함 수 명 : menu 함수설명 : GNB/TNB 등 메뉴 관련 처리
 ******************************************************************************/
util.prototype.menu = {
	/***************************************************************************
	 * 함 수 명 : setMenu 함수설명 : URL 기반 메뉴 생성 및 하이라이트 처리
	 **************************************************************************/
	setMenu : function() {
		$
				.ajax({
					cache : false,
					method : "GET",
					url : "/upload/menu.json",
					dataType : "json"
				})
				.done(
						function(data) {
							var path = location.href.split(location.host)[1]
									.replace(/;|#.*/g, ""), // 파라메터를 포함한
															// path(;jsessionid=...,
															// #none 등의 형태는 제거)
							menuInfo = util.menu.getMenu(data, path), menuCode = menuInfo.code, depth1MenuCode = menuCode
									.substring(0, 2)
									+ "000000", depth2MenuCode = menuCode
									.substring(0, 4)
									+ "0000", depth3MenuCode = menuCode
									.substring(0, 6)
									+ "00", depth3MenuCode = menuCode
									.substring(0, 6)
									+ "00", menuList = data, depth1MenuList = [], // 1뎁쓰
																					// 메뉴
							depth2MenuList = [], // 2뎁쓰 메뉴
							depth3MenuList = [], // 3뎁쓰 메뉴
							depth4MenuList = [], // 4뎁쓰 메뉴
							depth2IntroMenuList = [], // 회사소개 2뎁쓰 메뉴
							depth2ForeignMenuList = [], // 외국 2뎁쓰 메뉴
							i = 0, menuLength = menuList.length, menu = {};

							// 최근 본 화면 쿠키 생성
							// 즐겨찾기 리스트 생성
							// 메인 일때는 생성하지 않는다
							if (path !== "/") {
								util.menu.setResentVisit(menuInfo.name,
										menuInfo.url);
								util.menu.setBookmarkList();
							}

							// loop 횟수를 줄이기 위해 뎁쓰별로 메뉴를 저장해 둔다
							for (; i < menuLength; i++) {
								menu = menuList[i];
								if (menu.depth === 1) {
									if (depth1MenuCode === menu.code) {
										menu.selected = true;
									}
									depth1MenuList.push(menu);
								} else if (menu.depth === 2) {
									if (depth2MenuCode === menu.code) {
										menu.selected = true;
									}
									depth2MenuList.push(menu);
									if (menu.pcode === "07000000") {
										depth2IntroMenuList.push(menu);
									}
									if (menu.pcode === "11000000") {
										depth2ForeignMenuList.push(menu);
									}
								} else if (menu.depth === 3) {
									if (depth3MenuCode === menu.code) {
										menu.selected = true;
									}
									depth3MenuList.push(menu);
								} else if (menu.depth === 4) {
									if (menuCode === menu.code) {
										menu.selected = true;
									}
									depth4MenuList.push(menu);
								}
							}
							if (path.startsWith("/intro/")) { // 회사소개는 별도
								util.menu.drawGnbForIntro(depth2IntroMenuList,
										depth3MenuList, depth4MenuList);
								util.menu.drawTnbForIntro(menuCode);
							} else if (path.startsWith("/foreign/")) { // 외국어
																		// 페이지
								util.menu.drawGnbForIntro2(
										depth2ForeignMenuList, depth3MenuList,
										depth4MenuList);
								util.menu.drawTnbForIntro2(menuCode);
							} else {
								util.menu.drawGnb(depth1MenuList,
										depth2MenuList, depth3MenuList,
										depth4MenuList);
								util.menu.drawTnb(menuCode);
							}
						});
	},
	/***************************************************************************
	 * 함 수 명 : getMenu 함수설명 : 현재 페이지의 URL을 통해 메뉴 조회; 같은 URL이 있는 경우 하위 메뉴 반환
	 **************************************************************************/
	getMenu : function(data, path) {
		var menuList = data, i = menuList.length - 1;
		pathname = path, menu = {}, menuCode = ""
		useUrlPattern = false;
		if (pathname === "/") { // 메인인 경우 json으로 관리하지 않으므로 리턴
			return {
				code : "",
				name : "",
				url : ""
			};
		}
		for (; i >= 0; i--) { // loop를 거꾸로 돌려 가장 하위 뎁쓰 메뉴의 코드를 조회
			menu = data[i];
			useUrlPattern = (menu.curl.indexOf("*") > -1);
			if (menu.url === pathname
					|| menu.curl.indexOf(pathname) > -1
					|| (useUrlPattern && pathname.indexOf(menu.curl.replace(
							/\*/g, "")) > -1)) {
				menuCode = menu.code;
				break;
			}
		}
		return menu;
	},
	/***************************************************************************
	 * 함 수 명 : drawGnb 함수설명 : GNB 그리기(사이트맵과 같이 사용하기 위해 전체를 다 그림)
	 **************************************************************************/
	drawGnb : function(depth1MenuList, depth2MenuList, depth3MenuList, depth4MenuList) {
		var template = [], html = "";
		template.push('{{#each depth1MenuList}}');
		template.push('	<li class="d1 m{{inc @index}} {{#if selected}}selected{{/if}}">');
		template.push('		<a href="{{{url}}}" {{#if newWin}}target="_blank" title="새창"{{/if}} class="gp_className" ga-category="대표홈페이지_PC_공통_메인" ga-action="상단메뉴" ga-label="{{name}}">{{name}}{{#if tm}}<em class="icon_com ic4">tm</em>{{/if}}{{#if internet}}<em class="icon_com ic3">[새창]</em>{{/if}}{{#if new}}<em class="icon_com ic2">[NEW]</em>{{/if}}{{#if hot}}<em class="icon_com ic1">[HOT]</em>{{/if}}</a>');
		template.push('		<div class="sub_area">');
		template.push('			<ul>');
		template.push('				{{#each ../depth2MenuList}}');
		template.push('					{{#compare ../code pcode operator="==="}} ');
		template.push('						<li class="d2 s{{inc @index}} {{#if selected}}selected{{/if}}">');
		template.push('							<a href="{{{url}}}" {{#if newWin}}target="_blank" title="새창"{{/if}} class="gp_className" ga-category="대표홈페이지_PC_공통_메인" ga-action="상단메뉴" ga-label="{{name}}">{{name}}{{#if tm}}<em class="icon_com ic4">tm</em>{{/if}}{{#if internet}}<em class="icon_com ic3">[새창]</em>{{/if}}{{#if new}}<em class="icon_com ic2">[NEW]</em>{{/if}}{{#if hot}}<em class="icon_com ic1">[HOT]</em>{{/if}}</a>');
		template.push('							<ul>');
		template.push('								{{#each ../../depth3MenuList}}');
		template.push('									{{#compare ../code pcode operator="==="}}');
		template.push('										<li class="d3 {{#if selected}}selected{{/if}}">');
		template.push('											<a href="{{{url}}}" {{#compare name ""}}tabindex="-1"{{/compare}} {{#if newWin}}target="_blank" title="새창"{{/if}} class="gp_className" ga-category="대표홈페이지_PC_공통_메인" ga-action="상단메뉴" ga-label="{{name}}">{{name}}{{#if tm}}<em class="icon_com ic4">tm</em>{{/if}}{{#if internet}}<em class="icon_com ic3">[새창]</em>{{/if}}{{#if new}}<em class="icon_com ic2">[NEW]</em>{{/if}}{{#if hot}}<em class="icon_com ic1">[HOT]</em>{{/if}}</a>');
		template.push('											<ul>');
		template.push('												{{#each ../../../depth4MenuList}}');
		template.push('													{{#compare ../code pcode operator="==="}}');
		template.push('														<li class="d4 {{#if selected}}selected{{/if}}"><a href="{{{url}}}" {{#if newWin}}target="_blank" title="새창"{{/if}} class="gp_className" ga-category="대표홈페이지_PC_공통_메인" ga-action="상단메뉴" ga-label="{{name}}">{{name}}{{#if tm}}<em class="icon_com ic4">tm</em>{{/if}}{{#if internet}}<em class="icon_com ic3">[새창]</em>{{/if}}{{#if new}}<em class="icon_com ic2">[NEW]</em>{{/if}}{{#if hot}}<em class="icon_com ic1">[HOT]</em>{{/if}}</a></li>');
		template.push('													{{/compare}}');
		template.push('												{{/each}}');
		template.push('											</ul>');
		template.push('										</li> ');
		template.push('									{{/compare}}');
		template.push('								{{/each}}');
		template.push('							</ul>');
		template.push('						</li> ');
		template.push('					{{/compare}}');
		template.push('				{{/each}}');
		template.push('					<div class="banner_gnb gnb_m{{inc @index}}">');
		template.push('						{{#each ../bannerList}}');
		template.push('							{{#containsGnb imgUrlAdr @../index}} <a href="{{linkUrlAdr}}" title="자세히보기" target="{{linkMtdFlgcd}}"> <img src="{{imgUrlAdr}}" alt="{{imgXpnm}}"/> </a> {{/containsGnb}}');
		template.push('						{{/each}}');
		template.push('					</div>');
		template.push('			</ul>');
		template.push('		</div>');
		template.push('	</li>');
		template.push('{{/each}}');

		try{ //babberList가 있는 경우
			var html = Handlebars.compile(template.join(""))({
				depth1MenuList : depth1MenuList,
				depth2MenuList : depth2MenuList,
				depth3MenuList : depth3MenuList,
				depth4MenuList : depth4MenuList,
				bannerList : bannerList
			});
			console.log("bannerList true");
		}catch(e){ //babberList가 없는 경우
			var html = Handlebars.compile(template.join(""))({
				depth1MenuList : depth1MenuList,
				depth2MenuList : depth2MenuList,
				depth3MenuList : depth3MenuList,
				depth4MenuList : depth4MenuList
			});
			console.log("bannerList false");
		}

		$("#uiNavGnb").html(html);
		ui.navGnb();
		var uiSitemap = $plugin.popmodal($('#uiSitemap'), {
			position_auto : false,
			auto_focus : false,
			callback_load : function() {
			},
			callback_after : function() {
			}
		});
	},
	/***************************************************************************
	 * 함 수 명 : 함수설명 : 회사소개 GNB 그리기
	 **************************************************************************/
	drawGnbForIntro : function(depth2MenuList, depth3MenuList, depth4MenuList) {
		var template = [], html = "";
		template.push('{{#each depth2MenuList}}');
		template
				.push('	<li class="d1 m{{inc @index}} {{#if selected}}selected{{/if}}">');
		template.push('		<a href="{{{url}}}">{{name}}</a>');
		template.push('		<div class="sub_area">');
		template.push('			<ul>');
		template.push('				{{#each ../depth3MenuList}}');
		template.push('					{{#compare ../code pcode operator="==="}} ');
		template
				.push('						<li class="d2 s{{inc @index}} {{#if selected}}selected{{/if}}">');
		template.push('							<a href="{{{url}}}">{{name}}</a>');
		template.push('							<ul>');
		template.push('								{{#each ../../depth4MenuList}}');
		template.push('									{{#compare ../code pcode operator="==="}}');
		template
				.push('										<li class="d3 {{#if selected}}selected{{/if}}">');
		template.push('											<a href="{{{url}}}">{{name}}</a>');
		template.push('										</li> ');
		template.push('									{{/compare}}');
		template.push('								{{/each}}');
		template.push('							</ul>');
		template.push('						</li> ');
		template.push('					{{/compare}}');
		template.push('				{{/each}}');
		template.push('			</ul>');
		template.push('		</div>');
		template.push('	</li>');
		template.push('{{/each}}');
		var html = Handlebars.compile(template.join(""))({
			depth2MenuList : depth2MenuList,
			depth3MenuList : depth3MenuList,
			depth4MenuList : depth4MenuList
		});
		$("#uiNavGnb").html(html);
		ui.navGnb();
	},
	/***************************************************************************
	 * 함 수 명 : 함수설명 : 외국 GNB 그리기
	 **************************************************************************/
	drawGnbForIntro2 : function(depth2MenuList, depth3MenuList, depth4MenuList) {
		console.log("********************************");
		console.log(depth2MenuList);
		console.log(depth3MenuList);
		console.log(depth4MenuList);
		var template = [], html = "";
		template.push('{{#each depth2MenuList}}');
		template
				.push('	<li class="d1 m{{inc @index}} {{#if selected}}selected{{/if}}">');
		template.push('		<a href="{{{url}}}">{{name}}</a>');
		template.push('		<div class="sub_area">');
		template.push('			<ul>');
		template.push('				{{#each ../depth3MenuList}}');
		template.push('					{{#compare ../code pcode operator="==="}} ');
		template
				.push('						<li class="d2 s{{inc @index}} {{#if selected}}selected{{/if}}">');
		template.push('							<a href="{{{url}}}">{{name}}</a>');
		template.push('							<ul>');
		template.push('								{{#each ../../depth4MenuList}}');
		template.push('									{{#compare ../code pcode operator="==="}}');
		template
				.push('										<li class="d3 {{#if selected}}selected{{/if}}">');
		template.push('											<a href="{{{url}}}">{{name}}</a>');
		template.push('										</li> ');
		template.push('									{{/compare}}');
		template.push('								{{/each}}');
		template.push('							</ul>');
		template.push('						</li> ');
		template.push('					{{/compare}}');
		template.push('				{{/each}}');
		template.push('			</ul>');
		template.push('		</div>');
		template.push('	</li>');
		template.push('{{/each}}');
		var html = Handlebars.compile(template.join(""))({
			depth2MenuList : depth2MenuList,
			depth3MenuList : depth3MenuList,
			depth4MenuList : depth4MenuList
		});
		$("#uiNavGnb").html(html);
		ui.navGnb();
	},
	/***************************************************************************
	 * 함 수 명 : drawTnb 함수설명 : TNB 그리기
	 **************************************************************************/
	drawTnb : function(meneCode) {
		if (!!!menuCode) { // MenuCode가 없으면 TNB를 사용하지 않는 페이지이기 때문에 영역을 화면에서 제거
			$("#aside").remove();
			return false;
		}
		var $gnb = $("#uiNavGnb"), d2html = $gnb.find("li.d2.selected")
				.closest("ul").html(), d3html = $gnb.find("li.d3.selected")
				.closest("ul").html(), d4html = $gnb.find("li.d4.selected")
				.closest("ul").html(), $cate1 = $('#uiPathCate1'), $cate2 = $('#uiPathCate2'), $cate3 = $('#uiPathCate3'), $cate4 = $('#uiPathCate4');
		$("#uiPathCate1 ul").html($gnb.html());		// 항상 존재
		$("#uiPathCate1 ul .banner_gnb").remove();	// uiPathCate(메뉴트리)에 이미지 배너가 생기기 때문에 삭제..

		if (d2html) {
			$("#uiPathCate2 ul").html(d2html); // 서브 메인을 제외한 나머지 페이지는 항상 존재
			$("#uiPathCate2 ul .banner_gnb").remove();	// uiPathCate(메뉴트리)에 이미지 배너가 생기기 때문에 삭제..
			$cate2.show();
		}
		if (d3html) {
			$("#uiPathCate3 ul").html(d3html);
			$("#uiPathCate3 ul .banner_gnb").remove();	// uiPathCate(메뉴트리)에 이미지 배너가 생기기 때문에 삭제..
			$cate3.show();
		}
		if (d4html) {
			$("#uiPathCate4 ul").html(d4html);
			$("#uiPathCate4 ul .banner_gnb").remove();	// uiPathCate(메뉴트리)에 이미지 배너가 생기기 때문에 삭제..
			$cate4.show();
		}
		ui.navTnb();
	},
	/***************************************************************************
	 * 함 수 명 : drawTnbForIntro 함수설명 : 회사소개 TNB 그리기
	 **************************************************************************/
	drawTnbForIntro : function(meneCode) {
		if (!!!menuCode) { // MenuCode가 없으면 TNB를 사용하지 않는 페이지이기 때문에 영역을 화면에서 제거
			$("#aside").remove();
			return false;
		}
		var $gnb = $("#uiNavGnb"),
		// GNB에 그려져 있지 않은 메뉴는 TNB에 그릴 수 없기 때문에 1뎁스를 강제로 추가해 줌
		// 회사소개는 다른 1뎁스 메뉴 없이 회사소개만 있으면 됨
		$gnb = $('<ul><li class="selected"><a href="/intro/company/index.do">회사소개</a><ul>'
				+ $gnb.html() + '</ul></li></ul>'), d2html = $gnb.find(
				"li.d1.selected").closest("ul").html(), d3html = $gnb.find(
				"li.d2.selected").closest("ul").html(), d4html = $gnb.find(
				"li.d3.selected").closest("ul").html(), $cate1 = $('#uiPathCate1'), $cate2 = $('#uiPathCate2'), $cate3 = $('#uiPathCate3'), $cate4 = $('#uiPathCate4');

		$("#uiPathCate1 ul").html($gnb.html()); // 항상 존재

		if (d2html) {
			$("#uiPathCate2 ul").html(d2html); // 서브 메인을 제외한 나머지 페이지는 항상 존재
			$cate2.show();
		}
		if (d3html) {
			$("#uiPathCate3 ul").html(d3html);
			$cate3.show();
		}
		if (d4html) {
			$("#uiPathCate4 ul").html(d4html);
			$cate4.show();
		}
		ui.navTnb();
	},
	/***************************************************************************
	 * 함 수 명 : drawTnbForIntro 함수설명 : 영어 TNB 그리기
	 **************************************************************************/
	drawTnbForIntro2 : function(meneCode) {
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		console.log(meneCode);
		if (!!!menuCode) { // MenuCode가 없으면 TNB를 사용하지 않는 페이지이기 때문에 영역을 화면에서 제거
			$("#aside").remove();
			return false;
		}
		var $gnb = $("#uiNavGnb"),
		// GNB에 그려져 있지 않은 메뉴는 TNB에 그릴 수 없기 때문에 1뎁스를 강제로 추가해 줌
		// 회사소개는 다른 1뎁스 메뉴 없이 회사소개만 있으면 됨
		$gnb = $('<ul><li class="selected"><a href="/foreign/overview01.do">foreign</a><ul>'
				+ $gnb.html() + '</ul></li></ul>'), d2html = $gnb.find(
				"li.d1.selected").closest("ul").html(), d3html = $gnb.find(
				"li.d2.selected").closest("ul").html(), d4html = $gnb.find(
				"li.d3.selected").closest("ul").html(), $cate1 = $('#uiPathCate1'), $cate2 = $('#uiPathCate2'), $cate3 = $('#uiPathCate3'), $cate4 = $('#uiPathCate4');

		$("#uiPathCate1 ul").html($gnb.html()); // 항상 존재

		if (d2html) {
			$("#uiPathCate2 ul").html(d2html); // 서브 메인을 제외한 나머지 페이지는 항상 존재
			$cate2.show();
		}
		if (d3html) {
			$("#uiPathCate3 ul").html(d3html);
			$cate3.show();
		}
		if (d4html) {
			$("#uiPathCate4 ul").html(d4html);
			$cate4.show();
		}
		ui.navTnb();
	},
	/***************************************************************************
	 * 함 수 명 : setResentVist 함수설명 : 최근 본 화면 쿠키 생성
	 *
	 * name - 페이지 이름 url - 페이지 경로
	 **************************************************************************/
	setResentVisit : function(name, url) {
		var max = 5;
		var isOverlap = false;
		var cookie = util.cookieList.get("giResentVisit");

		// 중복값이 있으면 저장하지 않는다.
		for (value in cookie) {
			if (cookie[value].url == url) {
				isOverlap = true;
			}
		}

		// 쿠키 생성
		if (!isOverlap)
			util.cookieList.set("giResentVisit", {
				name : name,
				url : url
			});

		// 최대 5개 저장
		if (util.cookieList.get("giResentVisit").length > max && !isOverlap) {
			// 마직막으로 방문한 페이지 데이터 삭제
			util.cookieList.removeAt("giResentVisit", 0);
		}

		// 최근 본 화면 그리기
		util.menu.drawResentVisit();
	},

	/***************************************************************************
	 * 함 수 명 : drawResentVisit 함수설명 : 최근 본 화면 그리기
	 **************************************************************************/
	drawResentVisit : function() {
		var cookie = util.cookieList.get("giResentVisit");
		if (cookie.length) {
			var lists = '';
			$("#resentVisit ul").empty();
			for (var i = cookie.length; i > 0; i--) {
				var list = cookie[i - 1];
				lists += '<li><a href="' + list.url + '"><span>' + list.name
						+ '</span></a></li>';
			}
			$("#resentVisit ul").append(lists);
		} else {
			$("#resentVisit ul").remove();
			$("#resentVisit").append('<span>최근 본 화면이<br/>없습니다.</span>');
		}
	},

	/***************************************************************************
	 * 함 수 명 : setBookmarkList 함수설명 : 즐겨찾기 리스트 가져오기
	 **************************************************************************/
	setBookmarkList : function() {
		var data = {};
		// 리스트를 5개만 가져온다
		data['limitNum'] = 5;

		$.ajax({
			method : "POST",
			url : "/my/bookmark/bookmark-my-list-data.json",
			data : data,
			dataType : "json"
		}).done(function(data) {
			if (data.loginCheck && data.list.length) {
				util.menu.drawBookmarkList(data);
			} else {
				// 로그인 하지 않았거나 리스트가 없으면 미리 설정된 메뉴를 출력
				util.menu.getDefaultBookmarkList(function(data) {
					util.menu.drawBookmarkList(data);
				})
			}
		}).fail(function(jqXHR, textStatus) {
			util.alert("xhr : " + jqXHR + ", textStatus : " + textStatus);
		});
	},

	/***************************************************************************
	 * 함 수 명 : getDefaultBookmarkList 함수설명 : 즐겨찾기 리스트 가져오기
	 **************************************************************************/
	getDefaultBookmarkList : function(callback) {
		var data = {};
		data['limitNum'] = 5;
		$.ajax({
			method : "POST",
			url : "/my/bookmark/bookmark-list-data.json",
			data : data,
			dataType : "json"
		}).done(function(data) {
			callback(data);
		}).fail(function(jqXHR, textStatus) {
			util.alert("xhr : " + jqXHR + ", textStatus : " + textStatus);
		});
	},

	/***************************************************************************
	 * 함 수 명 : drawResentVisit 함수설명 : 즐겨찾기 그리기
	 **************************************************************************/
	drawBookmarkList : function(data) {
		var lists = '';
		$("#myFavority ul").empty();
		for (var i = 0; i < data.list.length; i++) {
			var list = data.list[i];
			lists += '<li class="' + list.fvrBjIconUrlAdr + '"><a href="'
					+ list.fvrBjUrlAdr + '" title="' + list.fvrBjMenuNm
					+ '"><span>' + list.fvrBjMenuNm + '</span></a></li>';
		}
		$("#myFavority ul").append(lists);
	}
};
/*******************************************************************************
 * 함 수 명 : search 함수설명 : 통합검색 관련 처리
 ******************************************************************************/
util.prototype.search = {
	// 디폴트 추전 검색어 질의용 쿼리(톰합검색)
	defaultRecommendQuery : "보험",
	// 디폴트 추전 검색어 질의용 쿼리(보험용어사전)
	defaultDicRecommendQuery : "보험",
	/***************************************************************************
	 * 함 수 명 : init 함수설명 : 초기화
	 **************************************************************************/
	init : function() {
		// 인기검색어
		util.search.searchPopular("homepage", function(resultData) {
			var i = 0, list = resultData.Data.Query, len = list.length
			words = [];
			for (; i < len; i++) {
				words.push('<a href="/util/search/search.do?query='
						+ encodeURIComponent(list[i].content) + '">'
						+ list[i].content + '</a>');
			}
			$("#popularSearchWordList").html(words.join(""));
		});
	},
	/***************************************************************************
	 * 함 수 명 : searchRecommend 함수설명 : 추천 검색어
	 **************************************************************************/
	searchRecommend : function(label, query, callback) {
		var promise = $.ajax(
				{
					method : "GET",
					url : "/totalsearch/popword2.do?target=recommend&label="
							+ label + "&datatype=xml&charset=UTF-8&query="
							+ encodeURIComponent(query) + "",
					dataType : "html"
				}).done(callback);
	},
	/***************************************************************************
	 * 함 수 명 : searchPopular 함수설명 : 인기검색어
	 **************************************************************************/
	searchPopular : function(collection, callback) {
		var promise = $.ajax(
				{
					method : "GET",
					url : "/totalsearch/popword2.do?target=popword&collection="
							+ collection
							+ "&range=month&charset=UTF-8&datatype=json",
					dataType : "json"
				}).done(callback);
	}
};

util.prototype.talktalk = {

	popup : null,
	init : function() {
		var _this = this;
		$("#uiPOPTalktalk .btn_area1 > button").click(function() {
			if (util.info.isOwnDentiPrd()) { // 보험가입 검사
				console.log('license pass');

				_this.registerBlogSvcUser(function() {
					alert("가입되었습니다.");
				});

			} else {
				alert("치아보험에 가입하신 고객만 이용가능합니다."); // 사용안함.
			}

			util.talktalk.popup.closeOutput();
		});
		util.talktalk.popup = $plugin.popmodal($('#uiPOPTalktalk'));
	},
	/***************************************************************************
	 * 함 수 명 : isTalkUser 함수설명 : 톡톡라운지 서비스 가입자 확인
	 *
	 * @param callback(inturrptCode,
	 *            boolean | jqXHR, data | textStatus) inturrptCode: 0=OK,
	 *            1=FAIL, 2=UserNotLogin boolean | jqXHR: inturrptCode가 0이면
	 *            boolean, 1이면 jqXHR, 2이면 undefined data | textStatus:
	 *            inturrptCode가 0이면 userInfo, 1이면 textStatus
	 **************************************************************************/
	isTalkUser : function(callback) {

		if (util.info.isLogin()) {
			$.ajax({
				method : "POST",
				async : false,
				url : "/lounge/talk/is-talk-user.json",
				dataType : "json"
			}).done(
					function(data) {

						if (data != null && data.info != null
								&& data.info.isTalkSvcUser != null) {
							callback(0, data.info.isTalkSvcUser == 'Y',
									data.info)
						} else {
							callback(0, false, data.info);
						}

					}).fail(function(jqXHR, textStatus) {
				callback(1, jqXHR, textStatus);
			});

		} else {
			callback(2);
		}

	},

	/***************************************************************************
	 * 함 수 명 : moveTalkMenu 함수설명 : Header또는 사이트맵에서 메뉴이동시 사용
	 **************************************************************************/
	moveTalkMenu : function(uri) {
		this.isTalkUser(function(returnCode, arg1, arg2) {
			switch (returnCode) {
			case 0: // 로그인 상태
				if (arg1) {
					// 톡톡라운지 서비스 유저
					location.href = uri;
				} else {
					// 톡톡라운지 서비스 유저 아님
					util.talktalk.popup.openOutput();
					return false;
				}
				break;
			case 1: // 확인과정에서 오류
				util.alert("xhr : " + jqXHR + ", textStatus : " + textStatus);
				return false;
				break;
			case 2: // 로그인 필요
				location.href = "/util/login/login.do";
				break;
			default: // 예외사항
				console.log("ReturnCode: " + returnCode);
				return false;
			}
			return true;
		})
	},

	/***************************************************************************
	 * 함 수 명 : registerBlogSvcUser 함수설명 : 하얀미소 치아보험 가입
	 **************************************************************************/
	registerBlogSvcUser : function(callback) {
		$.ajax({
			method : "POST",
			async : false,
			url : "/lounge/talk/register-talk-user.json",
			dataType : "json"
		}).done(function(data) {
			callback();
		}).fail(function(jqXHR, textStatus) {
			callback(1, jqXHR, textStatus);
		});
	}
};

/*******************************************************************************
 * 함 수 명 : cookieList 함수설명 : 쿠키 배열 관리
 ******************************************************************************/
util.prototype.cookieList = {
	set : function(name, value) {
		var cookie = Cookies.getJSON(name);
		var items = cookie ? cookie : [];
		items.push(value);
		Cookies(name, items, {
			expires : 1 * 365 * 1000
		});
	},

	get : function(name) {
		var cookie = Cookies.getJSON(name);
		var items = cookie ? cookie : [];
		return items;
	},

	removeAt : function(name, index) {
		var cookie = Cookies.getJSON(name);
		var items = cookie ? cookie : [];
		items.splice(index, 1);
		Cookies(name, items);
	}
};

/*******************************************************************************
 * 함 수 명 : globalPopup 함수설명 : 팝업관리
 ******************************************************************************/
util.prototype.globalPopup = {
	layerCount : -1, /* shutOffCount: -1, */
	slideCount : -1,
	init : function() {
		this.getPopupList();
	},

	getPopupList : function() {
		var _this = this;
		$.ajax({
			type : "POST",
			async : false,
			url : "/popup/global_popup_list.json",
			dataType : "json",
			success : function(data, textStatus, jqXHR) {
				var list = data.list;
				if (list.length) {
					$.each(list, function(i) {
						// 지정한 URL만 팝업을 띄운다
						// 메인은 '/', '/index.do'로 접근 가능하므로 예외처리
						var currentURL = location.pathname + location.search;
						if (this.popuUrlAdr == "/index.do")
							this.popuUrlAdr = "/";
						if (currentURL == "/index.do")
							currentURL = "/"
						if (currentURL != this.popuUrlAdr)
							return;

						// 레이어 팝업, 슬라이드 팝업의 두번째 데이터는 열지 않는다
						if (this.popuMtdFlgcd == "2")
							_this.layerCount++;
						if (this.popuMtdFlgcd == "4")
							_this.slideCount++;

						// 오늘 하루 열지 않음 쿠키가 있으면 열지 않는다.
						if (Cookies("HWGP" + this.popuNo))
							return;

						switch (this.popuMtdFlgcd) {
						case "1":
							_this.windowPopup(this);
							break;
						case "2":
							// 레이어 팝업
							// 첫번째 레이어 팝업만 호출
							if (_this.layerCount)
								return;
							_this.layerPopup(this);
							break;
						case "3":
							// 셧오프 팝업
							_this.shutOffPopup(this);
							break;

						case "4":
							// 슬라이드 팝업
							if (_this.slideCount)
								return;
							_this.slidePopup(this);
							break;
						case "5": //고객정보슬라이드팝업
							_this.slidePopup(this);
							break;
						case "6": //로그인정보팝업
							if (_this.slideCount1)
								return;
							_this.slidePopup(this);
							break;
						case "7": //전자적미동의팝업
							if (_this.slideCount1)
								return;
							_this.slidePopup(this);
							break;
						}
					});
				}
			}
		});
	},

	windowPopup : function(data) {
		window.open("/popup/pop-global.do?popuNo=" + data.popuNo, "gp"
				+ data.popuNo, "width=" + data.popuScrWdtLngth + ", height="
				+ data.popuScrVrtlLngth + ", left=" + data.popuScrXCdnvl
				+ ", top=" + data.popuScrXCdnvl + ", scrollbars=0");
		return false;
	},

	layerPopup : function(data) {
		var _this = this;
		$("body").append(this.getlayerPopupLayout(data));

		var uiGlobalLayerPopup = $plugin.popmodal($('#uiGlobalLayerPopup'), {
			auto_focus : false,
			load_display : true,
			callback_after : function() {
				if ($("#chkCookieGlobalLayerPopup").is(":checked")) {
					_this.setDailyCookie(data.popuNo);
				}
			}
		});
	},

	getlayerPopupLayout : function(data) {
		var elements = '';
		elements += '<div id="uiGlobalLayerPopup" class="pop_notice2" style="width:'
				+ data.popuScrWdtLngth + 'px;margin-left:-330px;">\n';
		elements += '	<div class="content">\n';
		elements += '		<dl>\n';
		elements += '			<dt>' + data.popuTitl + '</dt>\n';
		elements += '			<dd>' + data.popuCn + '</dd>\n';
		elements += '			<dd class="bottom">\n';
		elements += '				<span class="label_form">\n';
		elements += '					<label for="chkCookieGlobalLayerPopup">';
		elements += '						<input type="checkbox" id="chkCookieGlobalLayerPopup"/>\n';
		elements += '						<span>오늘 하루 열지 않음</span>\n';
		elements += '					</label>\n';
		elements += '				</span>\n';
		elements += '				<button type="button" class="ui-close">'
				+ data.popuTitl + ' 닫기</button>\n';
		elements += '			</dd>\n';
		elements += '		</dl>\n';
		elements += '	</div>\n';
		elements += '</div>\n';
		return elements;
	},

	shutOffPopup : function(data) {
		var clone = $("#aside").clone();
		$("#container").empty();
		$("#container").append(data.popuCn);
		$("#aside").remove();
		$("#container").prepend(clone);
	},

	slidePopup : function(data) {
		var _this = this;
		if(data.popuMtdFlgcd == "4"){ //관리자에서 입력한 슬라이드 팝업
			$("#skipnav").after(this.getSlidePopupLayout(data));
		}else { //고객클렌징 슬라이드팝업 >> 법인에서는 노출 안되도록..
			if(loginUserNo != ''){
				$("#header").prepend(this.getSlidePopupCustInfoLayout(data));
			}
		}
		var uiGlobalSlidePopup = $plugin.popmodal($('#uiGlobalSlidePopup'), {
			overlay : false,
			position_auto : false,
			auto_focus : false,
			load_display : true,
			load_animation : true,

			callback_after : function() {
				if ($("#chkCookieGlobalSlidePopup").is(":checked")) {
					_this.setDailyCookie(data.popuNo);
				}
			}
		});
	},
	getSlidePopupCustInfoLayout : function(data) {
		var elements = '';
		elements += '<div id="uiGlobalSlidePopup" class="pop_notice1">\n';
		elements += '	<div class="content">\n';
		elements += '		<dl>\n';
		elements += '			<dt>' + data.popuTitl + '</dt>\n';
		elements += '			<dd><a href="#none"></a><p><a href="#none"></a><a href=' + data.linkUrlAdr + '><img alt=' + data.popuTitl + ' src=' + data.imgUrlAdr + '><br></a></p></dd>\n';
		elements += '			<dd class="bottom">\n';
		elements += '				<span class="label_form">\n';
		elements += '					<label for="chkCookieGlobalSlidePopup">\n';
		elements += '						<input type="checkbox" id="chkCookieGlobalSlidePopup"/>\n';
		elements += '						<span>오늘 하루 열지 않음</span>\n';
		elements += '					</label>\n';
		elements += '				</span>\n';
		elements += '				<button type="button" class="ui-close">' + data.popuTitl + ' 닫기</button>\n';
		elements += '			</dd>\n';
		elements += '		</dl>\n';
		elements += '	</div>\n';
		elements += '</div>\n';
		return elements;
	},
	getSlidePopupLayout : function(data) {
		var elements = '';
		elements += '<div id="uiGlobalSlidePopup" class="pop_notice1">\n';
		elements += '	<div class="content">\n';
		elements += '		<dl>\n';
		elements += '			<dt>' + data.popuTitl + '</dt>\n';
		elements += '			<dd><a href="#none">' + data.popuCn + '</a></dd>\n';
		elements += '			<dd class="bottom">\n';
		elements += '				<span class="label_form">\n';
		elements += '					<label for="chkCookieGlobalSlidePopup">\n';
		elements += '						<input type="checkbox" id="chkCookieGlobalSlidePopup"/>\n';
		elements += '						<span>오늘 하루 열지 않음</span>\n';
		elements += '					</label>\n';
		elements += '				</span>\n';
		elements += '				<button type="button" class="ui-close">'
				+ data.popuTitl + ' 닫기</button>\n';
		elements += '			</dd>\n';
		elements += '		</dl>\n';
		elements += '	</div>\n';
		elements += '</div>\n';
		return elements;
	},

	setDailyCookie : function(popuNo) {
		Cookies("HWGP" + popuNo, "1", {
			expires : 1
		});
		return false;
	}
};

/*******************************************************************************
 * 함 수 명 : wa 함수설명 : 웹접근성 관련 처리
 ******************************************************************************/
util.prototype.wa = {
	validationObj : {
		selector : "",
		orgTitle : "",
		errorTitle : ""
	},
	resetTitle : function() {
		if (!!util.wa.validationObj.selector) {
			$(util.wa.validationObj.selector).attr("title",
					util.wa.validationObj.orgTitle);
			util.wa.validationObj.selector = "";
			util.wa.validationObj.orgTitle = "";
			util.wa.validationObj.errorTitle = "";
		}
	},
	setTitle : function(selector, errorMsg) {
		util.wa.validationObj.selector = selector;
		util.wa.validationObj.orgTitle = $(selector).attr("title") || "";
		util.wa.validationObj.errorTitle = errorMsg;
		$(selector).attr("title",
				($(selector).attr("title") || "") + " (입력오류)" + errorMsg);
	}
}

/*******************************************************************************
 * 함 수 명 : insertFileUpldLog 함수설명 : 파일 업로드 로그 적재
 ******************************************************************************/
util.prototype.insertFileUpldLog = {
	succesDext : function(fList, ID, url){
		var fNameArr = new Array();
		var fSizeArr = new Array();

		for(var i in fList.newFile.uploadName){
			fNameArr.push(fList.newFile.uploadName[i]);
			fSizeArr.push(fList.newFile.size[i]);
		}

		var logParam = {
				RSTCD : "1", // 1:성공, 2:실패
				STEPCD : "1", // 1:DEXT, 2:EDMS, 3:TLM
				RSVAL : "DEXT 업로드 성공",
				FILE_NAME : fNameArr,
				FILE_SIZE : fSizeArr,
				UPLOAD_DIV_FLGCD : ID,
				SCR_URL_ADR : url
		};
		util.insertFileUpldLog.sendLog(logParam);
	},
	failDext : function(fList, ID, code, message, url){
		var fNameArr = new Array();
		var fNameArr2 = new Array();
		var fSizeArr = new Array();
		var fStatusArr = new Array();

		for(var i in fList.newFile.uploadName){
			fNameArr.push(fList.newFile.uploadName[i]);
			fNameArr2.push(fList.newFile.originalName[i]);
			fSizeArr.push(fList.newFile.size[i]);
			fStatusArr.push(fList.newFile.status[i]);
		}

		var logParam = {
				RSTCD : "2", // 1:성공, 2:실패
				STEPCD : "1", // 1:DEXT, 2:EDMS, 3:TLM
				RSVAL : fStatusArr,
				FILE_NAME : fNameArr,
				FILE_SIZE : fSizeArr,
				UPLOAD_DIV_FLGCD : ID,
				SCR_URL_ADR : url,
				errCode : code,
				errMessage : message,
				originalName : fNameArr2
		};
		util.insertFileUpldLog.sendLog(logParam);
	},
	sendLog : function(logParam){
		var logParam = JSON.stringify(logParam);

		$.ajax({
			method : "POST",
			url : "/file/file-Upld-Log-insert.json",
			data : logParam,
			asyncFlag : true,
			dataType : "json",
			contentType :"application/json;charset=UTF-8"
		}).done(function(data) {

		}).fail(function(jqXHR, textStatus) {
			util.alert("xhr : " + jqXHR + ", textStatus : " + textStatus);
		});
	}
};

/**
 * 고객클렌징, 모바일안내장 안내팝업
 */
util.prototype.custChgPop = {

		popup : null,
		init : function() {

			var _this = this;

			//고객정보변경
			$("#uiPOPCustInfoChg .btn_area > .btn_com").click(function() {
				Cookies.set("isPOPCustInfoChg", true);
				sessionStorage.setItem("isOpenCustChgPop", loginUserNo);
				util.custChgPop.popup.closeOutput();
				location.href = '/my/member/change01.do';
			});

			//모바일안내장 - 수신동의 후 이벤트 페이지 이동
			$("#uiPOPCtmAgreEvent .btn_area1 > #eventBtn").click(function() {
				util.custChgPop.setCtmAgre();
				location.href = '/lounge/event/event-view.do?eventNo=127';
			});
			$("#uiPOPCtmAgreEvent .btn_area1 > #closeBtn").click(function() {
				util.custChgPop.popup.closeOutput();
			});


			//모바일안내장 - 수신동의 후 팝업 닫기
			$("#uiPOPCtmAgre .btn_area1 > #agreBtn").click(function() {
				util.custChgPop.setCtmAgre();
			});
			$("#uiPOPCtmAgre .btn_area1 > #closeBtn").click(function() {
				util.custChgPop.popup.closeOutput();
			});


			$("#chkCookiePOPCtmAgre1, #chkCookiePOPCtmAgre2").click(function() {
				Cookies("HWGPisPOPCtmAgre", "1", {
					expires : 7
				});
				util.custChgPop.popup.closeOutput();
			});

			var paramBody = {"eventNo" : "127"};

			bizCommon.ajaxJson("/my/my-info-check.json", paramBody, function(resultData){

				if(resultData.infoChgCd  == "01"){
					$("#cIChgNotice01").show();
					$("#cIChgNotice02").hide();
					$("#cIChgNotice03").hide();
					Cookies.set("isPOPCustInfoChg", false);
					util.custChgPop.popup = $plugin.popmodal($('#uiPOPCustInfoChg'));

				}else if(resultData.infoChgCd  == "02"){
					$("#cIChgNotice01").hide();
					$("#cIChgNotice02").show();
					$("#cIChgNotice03").hide();
					Cookies.set("isPOPCustInfoChg", false);
					util.custChgPop.popup = $plugin.popmodal($('#uiPOPCustInfoChg'));
				}else if(resultData.infoChgCd  == "03"){
					$("#cIChgNotice01").hide();
					$("#cIChgNotice02").hide();
					$("#cIChgNotice03").show();
					Cookies.set("isPOPCustInfoChg", false);
					util.custChgPop.popup = $plugin.popmodal($('#uiPOPCustInfoChg'));
				}else if(resultData.infoChgCd  == "04"){
					if(resultData.eventYn == "N"){
						util.custChgPop.popup = $plugin.popmodal($('#uiPOPCtmAgre'));
					}else{
						util.custChgPop.popup = $plugin.popmodal($('#uiPOPCtmAgreEvent'));
					}
				}else{

				}


				if(resultData.infoChgCd  != "04" && resultData.infoChgCd  != "00" &&
					Cookies.get("isPOPCustInfoChg") != "true" && sessionStorage.getItem("isOpenCustChgPop") != loginUserNo &&
					loginUserNo != ''){
					//01,02,03 고객정보 클렌징, 7일간보지 않기, 로그인시1번만 띄우기
					util.custChgPop.openCusChgPop();
				}else if(resultData.infoChgCd  == "04" && Cookies.get("HWGPisPOPCtmAgre") != "1"){
					util.custChgPop.openCusChgPop();
				}
			});

		},
		setCtmAgre : function(){

			var paramBody = {};

			bizCommon.ajaxJson("/my/my-set-ctmAgre.json", paramBody, function(resultData) {
				if(resultData.answCode.substring(3,4) != "I"){
					util.popup.errorPopup("CusC070.CA" /*전문코드*/, resultData /*response데이터 헤더영역*/);
				}else{
					util.custChgPop.popup.closeOutput();
				}
			});
		},
		openCusChgPop : function(){
			util.custChgPop.popup.openOutput();
		}

};



var util = new util();