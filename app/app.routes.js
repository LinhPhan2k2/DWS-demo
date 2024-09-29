app.config(function($routeProvider) {
    $routeProvider
        .when('/employee', {
            templateUrl: 'app/views/pages/employee.html',
            controller: 'EmployeeController'
        })
        .otherwise({
            redirectTo: '/employee'
        });
});