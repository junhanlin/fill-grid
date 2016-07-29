angular.module('fillGrid',[])
  .directive('fillGrid', function() {
    return {
      restrict: 'E',
      require: '?ngModel',
      scope: {
        backImg: '=',
        backSize: '=',
        maskImg: '=',
        row: '=',
        col: '=',
        radius: '=',
        fillableMap: '=',
        disabled: '='

      },
      templateUrl: 'template/fill-grid.html',
      link: function(scope, element, attrs, ngModel) {

        scope.$watch(attrs.backImg, function(value) {
          $(element).find('.fill-grid-wrapper').css('background-image', 'url(' + value + ')');

        });

        scope.$watch(attrs.backSize, function(value) {
          $(element).find('.fill-grid-wrapper').css('background-size', value);

        });

        scope.$watch(attrs.maskImg, function(value) {
          $(element).find('.fill-mask').css('background-image', 'url(' + value + ')');

        });






        var table = $(element).find('table');
        table.addClass('fill-table');

        for (var i = 0; i < scope.row; i++) {
          var tRow = $("<tr></tr>");
          table.append(tRow);
          // tRow.css('height',(1 / scope.row * 100) +'%');
        }
        var tRows = table.find('tr');
        for (var i = 0; i < scope.col; i++) {

          var tCell = $("<td></td>");
          tRows.append(tCell);




        }

        var isTouchDown = false;
        var shouldHighlight = null;
        var fillCells = table.find('td');
        var lastUpdated = null;

        function toggleCell(colIndex, rowIndex, highlighted) {

          rowIndex = Math.round(rowIndex);
          colIndex = Math.round(colIndex);
          if (colIndex < 0 || colIndex >= table[0].rows[0].cells.length || rowIndex < 0 || rowIndex >= table[0].rows.length) {
            return;
          }
          if (lastUpdated !== null && lastUpdated.colIndex == colIndex && lastUpdated.rowIndex == rowIndex && lastUpdated.highlighted === highlighted) {
            return;
          }

          if (scope.fillableMap && scope.fillableMap[rowIndex][colIndex] === 0) {
            return;
          }
          $(table[0].rows[rowIndex].cells[colIndex]).toggleClass("highlighted", highlighted);
          lastUpdated = {
            colIndex: colIndex,
            rowIndex: rowIndex,
            highlighted: highlighted
          };

        }

        function toggleHorizontalCells(startX, endX, y, highlighted) {
          startX = Math.round(startX);
          endX = Math.round(endX);
          y = Math.round(y);
          for (var x = startX; x <= endX; x++) {
            toggleCell(x, y, highlighted);
          }
        }

        function toggleCircleCells(x0, y0, radius, highlighted) {

          toggleCell(x0, y0, highlighted);

          var x = parseInt(radius);
          var y = 0;
          var decisionOver2 = 1 - x; // Decision criterion divided by 2 evaluated at x=r, y=0

          while (y <= x) {
            // toggleCell(x + x0, y + y0,highlighted);
            // toggleCell(y + x0, x + y0,highlighted);
            // toggleCell(-x + x0, y + y0,highlighted);
            // toggleCell(-y + x0, x + y0,highlighted);
            // toggleCell(-x + x0, -y + y0,highlighted);
            // toggleCell(-y + x0, -x + y0,highlighted);
            // toggleCell(x + x0, -y + y0,highlighted);
            // toggleCell(y + x0, -x + y0,highlighted);

            toggleHorizontalCells(-x + x0, x + x0, y + y0, highlighted);
            toggleHorizontalCells(-y + x0, y + x0, x + y0, highlighted);
            toggleHorizontalCells(-x + x0, x + x0, -y + y0, highlighted);
            toggleHorizontalCells(-y + x0, y + x0, -x + y0, highlighted);

            y++;
            if (decisionOver2 <= 0) {
              decisionOver2 += 2 * y + 1; // Change in decision criterion for y -> y+1
            } else {
              x--;
              decisionOver2 += 2 * (y - x) + 1; // Change for y -> y+1, x -> x-1
            }
          }
        }

        // fillCells
        //   .bind('touchstart', function(e) {
        //     isTouchDown = true;
        //
        //     var touchEv = e.originalEvent.touches[0];
        //     var touched = $(touchEv.target);
        //     var colWidth = touched.outerWidth();
        //     var rowHeigth = touched.outerHeight();
        //     var radius = attrs.radius;
        //     var colIndex = $(this).parent().children().index($(this));
        //     var rowIndex = $(this).parent().parent().children().index($(this).parent());
        //     shouldHighlight = !$(this).hasClass("highlighted");
        //
        //     toggleCircleCells(colIndex, rowIndex, radius, shouldHighlight);
        //
        //   })
        //   .bind('touchmove', function(e) {
        //     e.preventDefault();
        //     if (isTouchDown) {
        //       // console.log("move: " + $(this).text());
        //       var touchEv = e.originalEvent.touches[0];
        //
        //       var touched = $(touchEv.target);
        //       // console.log('target:'+touched.target.cellIndex);
        //       var x = touchEv.clientX;
        //       var y = touchEv.clientY;
        //       var colWidth = touched.outerWidth();
        //       var rowHeigth = touched.outerHeight();
        //       var offsetWidth = x - table.offset().left;
        //       var offsetHeight = y - table.offset().top;
        //
        //       var radius = attrs.radius;
        //
        //
        //       var colIndex = Math.floor(offsetWidth / colWidth);
        //       var rowIndex = Math.floor(offsetHeight / rowHeigth);
        //
        //
        //
        //       toggleCircleCells(colIndex, rowIndex, radius, shouldHighlight);
        //
        //
        //
        //
        //
        //     }
        //
        //   });

        $(element).find('.fill-mask').unbind('touchstart').bind('touchstart', function(e) {

          if(attrs.disabled)
          {
            return;
          }

          console.log('touch start');
          isTouchDown = true;
          //if the cell is unfillable then it will be hidden,
          //and if it is hidden, jQuery will fail to get the outerWidth
          //so here's a workaround:
          var firstCell = $(table[0].rows[0].cells[0]);
          var isUnfillable = firstCell.hasClass('unfillable');
          if (isUnfillable) {
            firstCell.removeClass('unfillable');
          }

          var cellWidth = $(table[0].rows[0].cells[0]).outerWidth();
          var cellHeight = $(table[0].rows[0].cells[0]).outerHeight();

          if (isUnfillable) {
            firstCell.addClass('unfillable');
          }

          var touchEv = e.originalEvent.touches[0];
          var touched = $(touchEv.target);
          // var colWidth = touched.outerWidth();
          // var rowHeigth = touched.outerHeight();
          var x = touchEv.clientX;
          var y = touchEv.clientY;
          var offsetWidth = x - table.offset().left;
          var offsetHeight = y - table.offset().top;

          var radius = attrs.radius;
          var colIndex = Math.floor(offsetWidth / cellWidth);
          var rowIndex = Math.floor(offsetHeight / cellHeight);

          var cell = table[0].rows[rowIndex].cells[colIndex];

          shouldHighlight = !$(cell).hasClass("highlighted");

          toggleCircleCells(colIndex, rowIndex, radius, shouldHighlight);


        });

        $(element).find('.fill-mask').unbind('touchmove').bind('touchmove', function(e) {
          e.preventDefault();
          if (isTouchDown) {
            // console.log("move: " + $(this).text());
            //if the cell is unfillable then it will be hidden,
            //and if it is hidden, jQuery will fail to get the outerWidth
            //so here's a workaround:
            var firstCell = $(table[0].rows[0].cells[0]);
            var isUnfillable = firstCell.hasClass('unfillable');
            if (isUnfillable) {
              firstCell.removeClass('unfillable');
            }

            var cellWidth = $(table[0].rows[0].cells[0]).outerWidth();
            var cellHeight = $(table[0].rows[0].cells[0]).outerHeight();

            if (isUnfillable) {
              firstCell.addClass('unfillable');
            }
            var touchEv = e.originalEvent.touches[0];

            var touched = $(touchEv.target);
            // console.log('target:'+touched.target.cellIndex);
            var x = touchEv.clientX;
            var y = touchEv.clientY;
            // var colWidth = touched.outerWidth();
            // var rowHeigth = touched.outerHeight();
            var offsetWidth = x - table.offset().left;
            var offsetHeight = y - table.offset().top;

            var radius = attrs.radius;


            var colIndex = Math.floor(offsetWidth / cellWidth);
            var rowIndex = Math.floor(offsetHeight / cellHeight);
            toggleCircleCells(colIndex, rowIndex, radius, shouldHighlight);

          }
        });

        scope.$watch(scope.fillableMap, function() {
          var table = $(element).find('table');
          if (scope.fillableMap) {
            scope.fillableMap.forEach(function(arr1d, rowIndex) {
              arr1d.forEach(function(canFill, colIndex) {
                $(table[0].rows[rowIndex].cells[colIndex]).toggleClass("unfillable", canFill === 0);

              });
            });

          } else {
            table.find('td').removeClass('unfillable');
          }

        });


        if (ngModel) {
          ngModel.$render = function() {

            if (ngModel.$viewValue) {
              if (ngModel.$viewValue.fillMap) {
                var highlightedCount = 0;
                table.find('tr').each(function() {
                  var row = $(this);
                  row.find('td').each(function() {
                    var cell = $(this);
                    var rowIdx = row[0].rowIndex;
                    var cellIdx = cell[0].cellIndex;
                    cell.toggleClass("highlighted", ngModel.$viewValue.fillMap[rowIdx][cellIdx] === 1);

                    if (ngModel.$viewValue.fillMap[rowIdx][cellIdx] === 1) {
                      highlightedCount++;
                    }

                  });
                });

                ngModel.$viewValue.row = scope.row;
                ngModel.$viewValue.col = scope.col;
                ngModel.$viewValue.highlighted = highlightedCount;



              } else {

              }

            } else {
              updateModelValue();
            }
          };

          if (!ngModel.isDirty) {
            //give it a clear value
            updateModelValue();
          }

        }



        function onTouchUp(ev) {
          if (isTouchDown) {
            isTouchDown = false;
            updateModelValue();
          }

        }




        function updateModelValue(ev) {
          if (ngModel) {
            var newVal = {
              row: scope.row,
              col: scope.col,
              highlighted: 0,
              fillMap: new Array(scope.row),
              fillable: 0

            };
            table.find('tr').each(function() {
              var row = $(this);
              row.find('td').each(function() {
                var cell = $(this);

                var rowIdx = row[0].rowIndex;
                var cellIdx = cell[0].cellIndex;
                if (!newVal.fillMap[rowIdx]) {
                  newVal.fillMap[rowIdx] = new Array(scope.col);
                }
                newVal.fillMap[rowIdx][cellIdx] = cell.hasClass('highlighted') ? 1 : 0;
                if (newVal.fillMap[rowIdx][cellIdx] === 1) {
                  newVal.highlighted++;
                }

              });
            });

            if (scope.fillableMap) {
              scope.fillableMap.forEach(function(arr1d) {
                arr1d.forEach(function(canFill) {
                  if (canFill !== 0) {
                    newVal.fillable++;
                  }
                });
              });
            } else {
              newVal.fillable = scope.row * scope.col;
            }



            ngModel.$setViewValue(newVal, ev);
          }

        }


        $(document).bind('touchend', onTouchUp);
        element.on('$destroy', function() {
          $(document).unbind('touchend', onTouchUp);
        });
      }

    };
  })
  .directive('fillGirdContainer', function() {
    return function(scope, element, attrs, ngModel) {
      $(element).addClass('fill-grid-item');
      scope.hasAdjusted = false;
      scope.$watch(function() {
        if (!scope.hasAdjusted) {
          console.log("Adjusting");
          var container = $(element);
          var height = $(window).height() - (container.offset().top);
          // container.outerHeight(container.outerWidth() / 3 * 4);
          container.outerHeight(height);

          var width = height / 4 * 3;

          container.outerWidth(width);
          scope.hasAdjusted = true;
        }

      });
    };

  });