function makeResponsive() {

    var svgArea = d3.select("body").select("svg");

    if(!svgArea.empty()) {
        svgArea.remove();
    }
    
    var svgWidth = 960;
    var svgHeight = 1000;

    var margin = {
        top: 20,
        right: 40,
        bottom: 100,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
    var svg = d3
        .select("#scatterArea")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append and SVG group
    var chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // ***********************************************
    // ***********************************************

    // x ==> Initial Params for xAxis
    var chosenXAxis = "poverty";
    // y ==> Initial Params for yAxis
    var chosenYAxis = "obesity";

    // x ==>  function used for updating x-scale var upon click on axis label
    function xScale(journalismData, chosenXAxis) {

        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(journalismData, d => d[chosenXAxis]) * 0.8,
            d3.max(journalismData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;

    }

    // y ==> function used for updating y-scale var upon click on axis label
    function yScale(journalismData, chosenYAxis) {

        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(journalismData, d => d[chosenYAxis]) * 0.8,
            d3.max(journalismData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);

        return yLinearScale;

    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
        return xAxis;
    }

    // function used for updating xAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
    
        yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
        return circlesGroup;
    }

    //function used for updating state labels with a transition to new 
    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]));

        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        // ****** x label ******
        var xlabel;

        if (chosenXAxis === "poverty") {
            xlabel = "Poverty (%):";
        }

        else if (chosenXAxis === "age") {
            xlabel = "Age (Median):";
        }

        else {
            xlabel = "Household Income (Median):";
        }


        // ****** y label ******
        var ylabel;

        if (chosenYAxis === "obesity") {
            ylabel = "Obesity (%): ";
        }

        else if (chosenYAxis === "smokes") {
            ylabel  = "Smokes (%): ";
        }

        else {
            ylabel = "Lacks Healthcare (%)";
        }

        var toolTip = d3
            .tip()
            .attr("class", "tooltip")
            .style("background", "black")
            .style("color", "white")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
            });

        circlesGroup
            .call(toolTip);

        circlesGroup
            // on mouseover event
            .on("mouseover", function(data) {
                toolTip.show(data);
            })
            // on mouseout event
            .on("mouseout", function(data) {
                toolTip.hide(data);
            });
        
        return circlesGroup;

    }   
      
    // Import data
    d3.csv("02_Data_Source/data.csv").then(function(journalismData, err) {

        //if (err) throw err;

        // parse data
        journalismData.forEach(function(data) {
            data.obesity            = +data.obesity;
            data.smokes             = +data.smokes;
            data.healthcareLow      = +data.healthcareLow;
            data.poverty            = +data.poverty;
            data.age                = +data.age;
            data.income             = +data.income;

            // read data
            console.log(data);

        });
        
        // xLinearScale function above csv import
        var xLinearScale = xScale(journalismData, chosenXAxis); 
        // yLinearScale function above csv import
        var yLinearScale = yScale(journalismData, chosenYAxis); 

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale); 

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(journalismData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 20)
            .attr("fill", "darkblue")
            .attr("opacity", "1");

        //append initial text
        var textGroup = chartGroup.selectAll(".stateText")
            .data(journalismData)
            .enter()
            .append("text")
            .classed("stateText", true)
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("dy", 3)
            .attr("font-size", "10px")
            .text(function(d){return d.abbr});

        // Create group for x-axis labels
        var xlabelsGroup = chartGroup
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var inPovertyLabel = xlabelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In poverty (%)");
        
        var ageLabel = xlabelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");
        
        var householdIncomeLabel = xlabelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // append y axis
        var ylabelsGroup = chartGroup
            .append("g")
            .attr("transform", `translate(${0 - margin.left/4}, ${(0 + height/2)})`);

        
        var obesityLabel = ylabelsGroup
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 0 - 20)
            .attr("dy", "1em")
            .classed("active", true)
            .attr("value", "obesity")
            .text("Obesity (%)");
        
        var smokesLabel = ylabelsGroup
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 0 - 40)
            .attr("dy", "1em")
            .classed("inactive", true)
            .attr("value", "smokes")
            .classed("axis-text", true)
            .text("Smokes (%)");

        var lacksHealthcareLabel = ylabelsGroup
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 0 - 60)
            .attr("dy", "1em")
            .classed("inactive", true)
            .attr("value", "healthcareLow")
            .classed("axis-text", true)
            .text("Lacks Healthcare (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // updates circles with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text with new x values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // x axis labels event listener
        xlabelsGroup
            .selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    console.log(chosenXAxis);

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(journalismData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis,);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);                                        
                    
                    //update text with new x values
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // ******* changes classes to change bold text ==> x
                    if (chosenXAxis === "poverty") {
                        inPovertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        householdIncomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else if (chosenXAxis === "age") {
                        inPovertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        householdIncomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }


                    else {
                        inPovertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        householdIncomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }


                }
            });

                
            // y axis labels event listener
            ylabelsGroup
            .selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenYAxis with value
                    chosenYAxis = value;

                    console.log(chosenYAxis);

                    // functions here found above csv import
                    // updates y scale for new data
                    yLinearScale = yScale(journalismData, chosenYAxis);

                    // updates y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    //update text with new y values
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                
                    // ******  changes classes to change bold text ==> y
                    if (chosenYAxis === "obesity") {
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        lacksHealthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else if (chosenYAxis === "smokes") {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        lacksHealthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        lacksHealthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }                  


                }
            });
});

}

makeResponsive();

d3.select(window).on("resize", makeResponsive);






