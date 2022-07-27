//python
function getData(){
    var flight_schedule
    $.ajax({
        type: "GET",
        async: false,
        url: "/get_data",
        data: {},
        success: function(response){
           flight_schedule = response;
        },
        error : function(request, status, error ) {
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);

        },
        complete : function () {
            try {
                var json = JSON.parse(flight_schedule);
                setData(flight_schedule);
                return (typeof json === 'object');
              } catch (e) {
                getData();
                return false;
              }
        }
      })
     return false; //flight_schedule;
}

function setData(json){
    obj = $.parseJSON(json);
    var flight = obj.response.body.items;
    var totalCount=0;
    var delayDepartureCount=0;
    var delayCount=0;
    var estimatedCount=0;
    for(var i=0 ; i < flight.length; i++){
        var remark = flight[i].remark;
        var scheduleDateTime = new Date();
        var estimatedDateTime = new Date();
        var now = new Date();
        scheduleDateTime.setHours(flight[i].scheduleDateTime.substring(0,2));
        scheduleDateTime.setMinutes(flight[i].scheduleDateTime.substring(2,4));
        estimatedDateTime.setHours(flight[i].estimatedDateTime.substring(0,2));
        estimatedDateTime.setMinutes(flight[i].estimatedDateTime.substring(2,4));
        var delayTime = ((estimatedDateTime/60000 - scheduleDateTime/60000));
        if(remark == '출발' && delayTime > 120){
            delayDepartureCount++;
        }
        if(delayTime > 10){
            delayCount++;
        }
        if(estimatedDateTime > now){
            estimatedCount++;
        }
        totalCount++;
    }
    $("#total_count").html(totalCount);
    $("#delay_departureCount").text(delayDepartureCount);
    $("#delay_count").text(delayCount);
    $("#estimated_Count").text(estimatedCount);
}

function setTimer(){
    var countdown = setInterval(function(){
        var now = new Date();
        $("#timer").html(now);
    }, 1000);
 }

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}


function getAviationStatsByTimeline(){
    var AviationStats
    $.ajax({
        type: "GET",
        async: false,
        url: "/get_AviationStatsByTimeline",
        data: {},
        success: function(response){
           aviationStats = response;
        },
        error : function(request, status, error ) {
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        },
        complete : function () {
            try {
                var json = JSON.parse(aviationStats);
                drawAviationStatsChart(aviationStats);
                return (typeof json === 'object');
              } catch (e) {
                getAviationStatsByTimeline();
                return false;
              }
        }
      })
}


function drawAviationStatsChart(aviationStats){
    obj = $.parseJSON(aviationStats);
    var stats = obj.response.body.items;
    var labels = [];
    var data = [];
    for (var i = 0 ; i < stats.length ; i++){
         labels.push(stats[i].time.substr(0,2));
         data.push(stats[i].depBaggage);
    }
    var myChart = new Chart($("#bar-chart"), {
                        type: 'bar',
                        data: {
                          labels: labels,
                          datasets: [
                            {
                              label: "customer(명)",
                              backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9"],
                              data: data
                            }
                          ]
                        },
                        options: {
                          legend: { display: false },
                          title: {
                            display: true,
                            text: '시간대별 출국자 수 (월)'
                          }
                        }
                    });
}


function getAviationStatsByAirline(){
    var AviationStats
    $.ajax({
        type: "GET",
        async: false,
        url: "/get_AviationStatsByAirline",
        data: {},
        success: function(response){
           aviationStats = response;
        },
        error : function(request, status, error ) {
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        },
        complete : function () {
            try {
                var obj = JSON.parse(aviationStats);
                drawBarChartHorizontal(obj);
                return (typeof json === 'object');
              } catch (e) {
                getAviationStatsByAirline();
                return false;
              }
        }
      })
}


function drawBarChartHorizontal(obj){
    var stats = obj.response.body.items;
    var labels = [];
    var data = [];
    var count = 0;
    for (var i = 0 ; i < stats.length ; i++){
        if(stats[i].depBaggage>100){
           labels.push(stats[i].airline);
           data.push(stats[i].depBaggage);
           count++;
        }
    }
    new Chart(document.getElementById("bar_chart_horizontal"), {
        type: 'horizontalBar',
        data: {
               labels: labels,
               datasets: [
               {
                  label: "flight(편수)",
                  backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9"],
                  data: data
               }
              ]
        },
        options: {
          title: {
            display: false,
            text: 'Predicted world population (millions) in 2050'
          }
        }
    });
}


$(function (){
    setTimer();
    getData();
    getAviationStatsByTimeline();
    getAviationStatsByAirline();

});

function IsJsonString(str) {
  try {
    var json = JSON.parse(str);
    return (typeof json === 'object');
  } catch (e) {
    return false;
  }
}