app.controller('AnalysisController', function ($scope, $rootScope, $http, AnalysisService) {
    // Get all task
    $scope.pjName = '';
    $scope.tasks = [];
    $scope.getTasks = function () {
        $scope.tasks = AnalysisService.getTasks()
            .then(function (response) {
                var projectName = angular.fromJson(sessionStorage.projectName)                
                $scope.tasks = response.data.filter((task) => task.title_Project == projectName || projectName == undefined)
                // $scope.pjName = projectName != undefine ? `of ${projectName}` : '';
                countTask($scope.tasks);
                resetCanvas('line_Chart', 'lineChart');
                showLineCharts($scope.tasks);
                resetCanvas('doughnut_Chart', 'doughnutChart');
                showDoughnutCharts(countTask($scope.tasks));
                resetCanvas('verticalBar_Chart', 'verticalBarChart');
                showVerticalBarChart($scope.tasks);

            }, function (error) {
                alert('No data');
                resetCanvas('line_Chart', 'lineChart');
                resetCanvas('doughnut_Chart', 'doughnutChart');
                resetCanvas('verticalBar_Chart', 'verticalBarChart');
            });
    };
    $scope.getTasks()

    // Show choose date popup
    $("#dtBox").DateTimePicker();

    // Filter task by person name, status, start date and end date
    $scope.filterData = {};
    var _params = {
        'accountId': null,
        'personName': null,
        'statusDelivery': null,
        'startDate': null,
        'endDate': null,
    }
    $('#inputStartDate').on('change', function () {
        $scope.$apply(function () {
            $scope.filterData.startDate = $('#inputStartDate').val();
        });
    });
    $('#inputEndDate').on('change', function () {
        $scope.$apply(function () {
            $scope.filterData.endDate = $('#inputEndDate').val();
        });
    });
    $scope.filter = function () {
        var apiUrl = 'https://localhost:7299/api/Issues/filter';
        _params = {
            'accountId': null,
            'personName': $scope.filterData.personName,
            'statusDelivery': $scope.filterData.statusDelivery,
            'startDate': $scope.filterData.startDate ? $scope.filterData.startDate : null,
            'endDate': $scope.filterData.endDate ? $scope.filterData.endDate : null,
        }
        if ($scope.filterData.endDate != null && $scope.filterData.startDate == null) {
            alert('Please enter start date')
            return;
        }
        if (Object.keys($scope.filterData).length == 0) {
            _params = null;
        }

        $http({
            method: 'GET',
            url: apiUrl,
            params: _params
        })
            .then(function (response) {
                if (typeof response.data == 'string') {
                    alert(response.data)
                    $scope.tasks = [];
                    countTask($scope.tasks);
                }
                else {
                    $scope.tasks = response.data;
                }
                reRenderChart();
            })
            .catch(function (error) {
                alert(error.data);
                reRenderChart();
            });
    }

    function reRenderChart() {
        resetCanvas('line_Chart', 'lineChart');
        showLineCharts($scope.tasks);
        resetCanvas('doughnut_Chart', 'doughnutChart');
        showDoughnutCharts(countTask($scope.tasks));
        resetCanvas('verticalBar_Chart', 'verticalBarChart');
        showVerticalBarChart($scope.tasks);
    }

    // count total task, on time, ahead or overdue
    $scope.tasksAhead = 0;
    $scope.tasksOnTime = 0;
    $scope.tasksOverDue = 0;
    $scope.totalTime = 0;
    function countTask(tasks) {
        $scope.tasksAhead = 0;
        $scope.tasksOnTime = 0;
        $scope.tasksOverDue = 0;
        $scope.totalTime = 0;

        tasks.forEach(task => {
            var status = task.statusDelivery.replaceAll('\r\n', '')
            $scope.totalTime += task.actualHours;
            
            if (status == "前倒し") {
                $scope.tasksAhead++;
            } else if (status == "納期通り") {
                $scope.tasksOnTime++;
            } else {
                $scope.tasksOverDue++;
            }
        });
        $scope.totalTime = $scope.totalTime.toFixed(2);
        
        return [$scope.totalTime, $scope.tasksAhead, $scope.tasksOnTime, $scope.tasksOverDue]
    }

    // Sort tasks
    $scope.propertyName = 'projectCode';
    $scope.reverse = true;
    $scope.isSortedAsc = true;
    $scope.isSortedVisible = false;
    $scope.sortBy = function (propertyName) {
        var icon = document.getElementsByClassName('sortIcon');
        $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
        $scope.propertyName = propertyName;
    };

    // Setup chart data
    // Data time by status delivery
    function groupActualHoursByPersonAndStatus(tasks) {
        var result = {};

        tasks.forEach(task => {
            var person = task.personName;
            var status = task.statusDelivery;
            var actualHours = task.actualHours;

            if (!result[person]) {
                result[person] = {
                    "納期通り": 0,
                    "前倒し": 0,
                    "遅延": 0
                };
            }

            if (result[person][status] !== undefined) {
                result[person][status] += actualHours;
            }
        });

        return result;
    };

    // Data total task of person by status
    function groupTotalTaskByPersonAndStatus(tasks) {
        var result = {};

        tasks.forEach(task => {
            var person = task.personName;
            var status = task.statusDelivery;

            if (!result[person]) {
                result[person] = {
                    "納期通り": 0,
                    "前倒し": 0,
                    "遅延": 0
                };
            }

            if (result[person][status] !== undefined) {
                result[person][status]++;
            }
        });

        return result;
    };

    // Chart Label
    function getLabels(data) {
        let labels = Object.keys(data);
        return labels;
    }

    // Create chart data type array
    function createArrayDataByStatus(data) {
        var onTime = [];
        var ahead = [];
        var overdue = [];

        for (let person in data) {
            onTime.push(data[person]["納期通り"]);
            ahead.push(data[person]["前倒し"]);
            overdue.push(data[person]["遅延"]);
        }

        return {
            onTime,
            ahead,
            overdue
        };
    };

    // Reset chart when data change
    function resetCanvas(parentID, canvasID) {
        $(`#${canvasID}`).remove(); // this is my <canvas> element
        $(`#${parentID}`).append(`<canvas id="${canvasID}"><canvas>`);

        var canvas = $(`#${canvasID}`); // why use jQuery?
        var ctx = $(`#${canvasID}`)[0].getContext('2d');
        ctx.canvas.width = $('#chart-container').width(); // resize to parent width
        ctx.canvas.height = $('#chart-container').height(); // resize to parent height
        var x = canvas.width / 2;
        var y = canvas.height / 2;
        ctx.font = '10pt Verdana';
        ctx.textAlign = 'center';
        ctx.fillText('This text is centered on the canvas', x, y);
    };

    // Line Chart
    $scope.charts = [];
    function showLineCharts(_data) {
        var ctx = document.getElementById('lineChart').getContext('2d');
        let groupData = groupTotalTaskByPersonAndStatus(_data);
        let dataTask = createArrayDataByStatus(groupData);

        let labels = getLabels(groupData);
        var taskChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ahead',
                    data: dataTask.ahead,
                    fill: false,
                    borderColor: '#FFCC00',
                    tension: 0.5
                },
                {
                    label: 'On time',
                    data: dataTask.onTime,
                    fill: false,
                    borderColor: '#8BC34A',
                    tension: 0.5
                },
                {
                    label: 'Overdue',
                    data: dataTask.overdue,
                    fill: false,
                    borderColor: '#F44336',
                    tension: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow custom resizing
            }
        });
    }

    // Doughnut Chart
    function showDoughnutCharts(_data) {
        var doughnut = document.getElementById('doughnutChart').getContext('2d');
        var doughnutChart = new Chart(doughnut, {
            type: 'doughnut',
            data: {
                labels: ['Ahead', 'On time', 'Overdue'],
                datasets: [{
                    label: 'Present by status',
                    data: _data,
                    backgroundColor: ['#FFCC00', '#8BC34A', '#F44336'],
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow custom resizing
            }
        });
    }

    // Bar Chart
    function showVerticalBarChart(_data) {
        var bar = document.getElementById('verticalBarChart').getContext('2d');
        var groupData = groupActualHoursByPersonAndStatus(_data)
        let labels = getLabels(groupData);
        let dataTime = createArrayDataByStatus(groupData)

        var barChart = new Chart(bar, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ahead',
                        data: dataTime.ahead,
                        borderColor: '#FFCC00',
                        backgroundColor: '#FFCC00',
                    },
                    {
                        label: 'On time',
                        data: dataTime.onTime,
                        borderColor: '#8BC34A',
                        backgroundColor: '#8BC34A',
                    },
                    {
                        label: 'Over due',
                        data: dataTime.overdue,
                        borderColor: '#F44336',
                        backgroundColor: '#F44336',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow custom resizing
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

});

