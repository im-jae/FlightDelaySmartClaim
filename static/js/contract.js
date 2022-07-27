function RefundApi(){
    $.ajax({
        type : 'post',
        url : '/searchContract',
        success:function(data){
            var obj = $.parseJSON(data)
            //callRefundApi(data);
        },error:function(xhr, status, error){
            console.log(xhr.responseText)
            return;
        }
    });
}

function callRefundApi (name,phone_number){
    var date = new Date();
    $.ajax({
        type : 'post',
        url : '/callRefundApi',
        data : {
                name : name,
                phone_number : phone_number
                }
        ,
        dataType: 'JSON',
        success:function(data){
            console.log(data)
            alert("지급되었습니다.");
        },error:function(xhr, status, error){
            console.log(xhr.responseText)
            alert("지급실패하였습니다.");
            return;
        }
    });
};

function searchContract(flight_id){
    $.ajax({
        type : 'post',
        url : '/search_contract',
        data : {flight_id : flight_id},
        success:function(data){
            var obj = $.parseJSON(data)
            constructTable('#table',obj)
        },error:function(xhr, status, error){
            console.log(xhr.responseText)
            return;
        }
    });
};

function constructTable(selector,list) {
    // Getting the all column names
//    var cols = Headers(list, selector);
    var body = $('<tbody/>')
    // Traversing the JSON data
    for (var i = 0; i < list.length; i++) {
        var row = '<tr>';
            row+= '<td>'+list[i].PLYNO+'</td>';
            row+= '<td>'+list[i].FLIGHT_ID+'</td>';
            row+= '<td>'+list[i].CTMNM+'</td>';
            row+= '<td>'+list[i].TEL+'</td>';
            if(list[i].TWAY == '1'){
                row+= '<td><a href="#none" id="" class="btn_sub1" style="width:90px;"><img src="/static/images/tway_logo.png"> 인증</a></td>';
            }else if(list[i].FLIGHT_TICKET != null || list[i].FLIGHT_TICKET == ''){
                row+= '<td><a href="#none" id="" class="btn_sub1" style="width:90px;" onclick="window.open(\''+list[i].FLIGHT_TICKET+'\',\'_blank\',\'width=430,height=500,location=no,status=no,scrollbars=yes\')">항공권 인증</a></td>';
            }else if((list[i].LATITUDE != null || list[i].LATITUDE == '')&&(list[i].LONGITUDE != null || list[i].LONGITUDE == '')){
                row+= '<td><a href="#none" id="" class="btn_sub1" style="width:90px;" onclick="window.open(\'https://www.google.com/maps/place/'+list[i].LATITUDE+','+list[i].LONGITUDE+'\',\'_blank\',\'width=1280,height=720,location=no,status=no,scrollbars=yes\')">위치 인증</a></td>';
            }else{
                row+= '<td> - </td>';
            }
            row+= '<td><a href="#none" id="" class="btn_sub1" onclick="callRefundApi(\''+list[i].CTMNM+'\',\''+list[i].TEL+'\')">지급</a></td>';
            row+= '</tr>'
        body.append(row);
    }
    $(selector).append(body);
}

function Headers(list, selector) {
    var columns = [];
    var header = $('<tr/>');
    for (var i = 0; i < list.length; i++) {
        var row = list[i];

        for (var k in row) {
            if ($.inArray(k, columns) == -1) {
                columns.push(k);

                // Creating the header
                header.append($('<th/>').html(k));
            }
        }
    }
    header.append($('<th/>').html('심사'));
    header.append($('<th/>').html('지급'));

    // Appending the header to the table
    $(selector).append(header);
    return columns;
}

$(function (){
    searchContract("LJ201")
});