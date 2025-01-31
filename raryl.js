"use strict";
var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
        return typeof t
    } : function(t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    },
    geochart_geojson = {};
! function(t) {
    function e(t) {
        var e = {};
        return e.color = t.color, e.fontFamily = t.fontName, e.fontSize = t.fontSize + "px", t.bold && (e.fontWeight = "bold"), t.italic && (e.fontStyle = "italic"), e
    }

    function o(t, e) {
        var i = {};
        return i = JSON.parse(JSON.stringify(t)), Object.entries(e).forEach(function(t) {
            t[0] in i && "object" === _typeof(i[t[0]]) && null !== i[t[0]] && "object" === _typeof(t[1]) ? i[t[0]] = o(i[t[0]], t[1]) : i[t[0]] = t[1]
        }), i
    }
    var i = {
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: "#cccccc",
            backgroundColor: "#ffffff",
            padding: "4px"
        },
        a = function(t) {
            this.container = t, this.data_ = null, this.options_ = null, this.map_ = null, this.color_axis_ = null, this.tooltip_ = null, this.legend_ = null, this.min_ = 0, this.max_ = 0, this.feature_selected_ = null, this.data_has_values_ = !0
        };
    a.prototype.DEFAULT_OPTIONS = {
        backgroundColor: "#ffffff",
        colorAxis: {
            colors: ["#efe6dc", "#109618"],
            strokeColors: ["#cccccc", "#888888"]
        },
        datalessRegionColor: "#f5f5f5",
        datalessRegionStrokeColor: "#cccccc",
        defaultColor: "#267114",
        defaultStrokeColor: "#666666",
        displayMode: "regions",
        featureStyle: {
            fillOpacity: 1,
            strokeWeight: 1,
            strokeOpacity: .5
        },
        featureStyleHighlighted: {
            strokeWeight: 2,
            strokeOpacity: 1
        },
        geoJson: null,
        geoJsonOptions: null,
        legend: {
            position: "LEFT_BOTTOM",
            textStyle: {
                color: "#000000",
                fontName: "Arial",
                fontSize: 14,
                bold: !1,
                italic: !1
            }
        },
        mapsOptions: null,
        mapsBackground: "none",
        mapsControl: !1,
        tooltip: {
            textStyle: {
                color: "#000000",
                fontName: "Arial",
                fontSize: 13,
                bold: !1,
                italic: !1
            },
            trigger: "focus"
        }
    }, a.prototype.getMapsOptions_ = function() {
        var t = this.options_.mapsOptions;
        if (t.backgroundColor = this.options_.backgroundColor, "none" !== this.options_.mapsBackground) throw new Error("Invalid `mapsBackground` option");
        if (t.styles = [{
                stylers: [{
                    visibility: "off"
                }]
            }], this.options_.mapsControl) throw new Error("Invalid `mapsControl` option");
        return t.disableDefaultUI = !0, t.scrollwheel = !1, t.draggable = !1, t.disableDoubleClickZoom = !0, t
    }, a.prototype.draw = function(e) {
        var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        if (this.data_ = e, this.options_ = o(t.GeoChart.prototype.DEFAULT_OPTIONS, i), 2 === this.data_.getNumberOfColumns()) this.data_has_values_ = !0;
        else {
            if (1 !== this.data_.getNumberOfColumns()) throw new Error("Incompatible datatable (must have one or two columns)");
            this.data_has_values_ = !1
        }
        var a = this.getMapsOptions_();
        this.map_ = new google.maps.Map(this.container, a), this.map_.data.loadGeoJson(this.options_.geoJson, this.options_.geoJsonOptions, function(t) {
            for (var e = Number.MAX_VALUE, o = -Number.MAX_VALUE, i = 0; i < this.data_.getNumberOfRows(); i++) {
                var a = this.data_.getValue(i, 0),
                    l = 0;
                this.data_has_values_ && ((l = this.data_.getValue(i, 1)) < e && (e = l), l > o && (o = l));
                var h = this.map_.data.getFeatureById(a);
                h ? (h.setProperty("data-is-data", !0), h.setProperty("data-row", i), h.setProperty("data-id", a), this.data_has_values_ && (h.setProperty("data-label", this.data_.getColumnLabel(1)), h.setProperty("data-value", l))) : console.warn('Region "' + a + '" not found')
            }
            if (this.min_ = e, this.max_ = o, this.color_axis_ = new s(this), "none" !== this.options_.legend && this.data_has_values_ && this.data_.getNumberOfRows()) {
                var _ = null;
                this.legend_ = new n(this), _ = google.maps.ControlPosition[this.options_.legend.position], this.map_.controls[_].push(this.legend_.getContainer())
            }
            "none" !== this.options_.tooltip.trigger && (this.tooltip_ = new r(this)), google.visualization.events.trigger(this, "ready", null)
        }.bind(this)), this.map_.data.setStyle(function(t) {
            var e = Object.assign({}, {
                cursor: "default",
                fillColor: this.options_.datalessRegionColor,
                strokeColor: this.options_.datalessRegionStrokeColor
            }, this.options_.featureStyle);
            if (t.getProperty("data-is-data")) {
                if (void 0 !== t.getProperty("data-value")) {
                    var o = this.getRelativeValue_(t.getProperty("data-value")),
                        i = this.color_axis_.getRelativeColors(o);
                    e = Object.assign(e, {
                        fillColor: this.color_axis_.toHex(i[0]),
                        strokeColor: this.color_axis_.toHex(i[1])
                    })
                } else e = Object.assign(e, {
                    fillColor: this.options_.defaultColor,
                    strokeColor: this.options_.defaultStrokeColor
                });
                t.getProperty("data-selected") && (e = Object.assign(e, this.options_.featureStyleHighlighted, {
                    zIndex: 999
                }))
            }
            return e
        }.bind(this)), this.map_.data.addListener("mouseover", function(t) {
            t.feature !== this.feature_selected_ && this.highlightFeature_(t.feature), void 0 !== t.feature.getProperty("data-value") && this.legend_ && this.legend_.drawIndicator(t.feature)
        }.bind(this)), this.map_.data.addListener("mouseout", function(t) {
            t.feature !== this.feature_selected_ && this.map_.data.revertStyle(), this.tooltip_ && "focus" === this.options_.tooltip.trigger && this.tooltip_.undrawTooltip(), this.legend_ && this.legend_.undrawIndicator()
        }.bind(this)), this.map_.data.addListener("mousemove", function(t) {
            this.tooltip_ && "focus" === this.options_.tooltip.trigger && void 0 !== t.feature.getProperty("data-is-data") && this.tooltip_.drawTooltip(t.feature, t.latLng)
        }.bind(this)), this.map_.data.addListener("click", function(t) {
            this.map_.data.revertStyle(), t.feature !== this.feature_selected_ ? void 0 !== t.feature.getProperty("data-is-data") ? (this.selectFeature_(t.feature), this.tooltip_ && "selection" === this.options_.tooltip.trigger && this.tooltip_.drawTooltip(t.feature)) : (this.unselectFeature_(), this.tooltip_ && "selection" === this.options_.tooltip.trigger && this.tooltip_.undrawTooltip()) : (this.unselectFeature_(), this.tooltip_ && "selection" === this.options_.tooltip.trigger && this.tooltip_.undrawTooltip(), this.highlightFeature_(t.feature))
        }.bind(this)), this.map_.addListener("click", function(t) {
            this.map_.data.revertStyle(), this.unselectFeature_(), this.tooltip_ && "selection" === this.options_.tooltip.trigger && this.tooltip_.undrawTooltip()
        }.bind(this))
    }, a.prototype.highlightFeature_ = function(t) {
        var e = Object.assign({}, this.options_.featureStyleHighlighted, {
            zIndex: 1e3
        });
        this.map_.data.revertStyle(), this.map_.data.overrideStyle(t, e)
    }, a.prototype.getRelativeValue_ = function(t) {
        return (t - this.min_) / (this.max_ - this.min_)
    }, a.prototype.getSelection = function() {
        return this.feature_selected_ ? [{
            row: this.feature_selected_.getProperty("data-row"),
            column: null
        }] : []
    }, a.prototype.setSelection = function(t) {
        var e = "",
            o = null;
        t.length ? 1 === t.length && (e = this.data_.getValue(t[0].row, 0), o = this.map_.data.getFeatureById(e), this.selectFeature_(o)) : this.unselectFeature_()
    }, a.prototype.selectFeature_ = function(t) {
        this.unselectFeature_(), this.feature_selected_ = t, this.feature_selected_.setProperty("data-selected", !0)
    }, a.prototype.unselectFeature_ = function() {
        this.feature_selected_ && (this.feature_selected_.removeProperty("data-selected"), this.feature_selected_ = null)
    }, t.GeoChart = a;
    var s = function(t) {
        this.geo_chart_ = t, this.single_value = !1, this.colors_ = [], this.stroke_colors_ = [], this.canvas_context_ = null, this.initCanvas_(), this.initColors_()
    };
    s.prototype.initCanvas_ = function() {
        var t = null,
            e = null;
        (t = document.createElement("canvas")).height = 1, t.width = 1, e = t.getContext("2d"), this.canvas_context_ = e
    }, s.prototype.initColors_ = function() {
        var t = this.geo_chart_.options_.colorAxis;
        if (this.colors_ = t.colors.map(this.toRgbArray.bind(this)), this.stroke_colors_ = t.strokeColors.map(this.toRgbArray.bind(this)), this.geo_chart_.min_ === this.geo_chart_.max_) {
            var e = this.colors_[this.colors_.length - 1],
                o = this.stroke_colors_[this.stroke_colors_.length - 1];
            this.single_value = !0, this.colors_ = [e, e], this.stroke_colors_ = [o, o]
        }
    }, s.prototype.numToHexStr_ = function(t) {
        return ("0" + t.toString(16)).slice(-2)
    }, s.prototype.toRgbaArray = function(t) {
        var e = [];
        return Array.isArray(t) ? (e = t, 3 === t.length && e.push(255), e) : (this.canvas_context_.fillStyle = "rgba(0, 0, 0, 0)", this.canvas_context_.clearRect(0, 0, 1, 1), this.canvas_context_.fillStyle = t, this.canvas_context_.fillRect(0, 0, 1, 1), e = this.canvas_context_.getImageData(0, 0, 1, 1).data)
    }, s.prototype.toRgbArray = function(t) {
        var e = this.toRgbaArray(t);
        return [e[0], e[1], e[2]]
    }, s.prototype.toRgba = function(t) {
        var e = this.toRgbaArray(t);
        return "rgba(" + e[0] + "," + e[1] + "," + e[2] + "," + e[3] / 255 + ")"
    }, s.prototype.toRgb = function(t) {
        var e = this.toRgbaArray(t);
        return "rgb(" + e[0] + "," + e[1] + "," + e[2] + ")"
    }, s.prototype.toHex = function(t) {
        var e = this.toRgbArray(t);
        return "#" + this.numToHexStr_(e[0]) + this.numToHexStr_(e[1]) + this.numToHexStr_(e[2])
    }, s.prototype.getRelativeColors = function(t) {
        function e(t, e) {
            for (var o = [], i = 0; i < 3; i++) o[i] = Math.round((t[1][i] - t[0][i]) * e + t[0][i]);
            return o
        }

        function o(t, o) {
            var i = [];
            if (2 === t.length) i = e(t, o);
            else {
                var a = 1 / (t.length - 1),
                    s = 0,
                    r = 0;
                1 === o ? (s = t.length - 2, r = 1) : (s = Math.floor(o / a), r = o % a / a), i = e([t[s], t[s + 1]], r)
            }
            return i
        }
        return this.single_value ? [this.colors_[1], this.stroke_colors_[1]] : [o(this.colors_, t), o(this.stroke_colors_, t)]
    }, s.prototype.getGradientCssStr = function() {
        var t = "background-image: -o-linear-gradient(left, {colors}); background-image: -moz-linear-gradient(left, {colors}); background-image: -webkit-linear-gradient(left, {colors}); background-image: -ms-linear-gradient(left, {colors}); background: linear-gradient(left, {colors})",
            e = this.colors_.map(this.toRgb.bind(this)).join(", ");
        return t = t.replace(/\{colors\}/g, e)
    }, t.ColorAxis = s;
    var r = function(t) {
        this.geo_chart_ = t, this.div_ = null, this.id_span_ = null, this.label_span_ = null, this.value_span_ = null, this.LatLng = null, this.setMap(this.geo_chart_.map_)
    };
    r.prototype = new google.maps.OverlayView, r.prototype.onAdd = function() {
        var t = null,
            o = null,
            a = null,
            s = null;
        t = document.createElement("div");
        var r = {};
        r = Object.assign({}, {
            position: "absolute",
            visibility: "hidden"
        }, i, {
            zIndex: 2e3
        }), Object.assign(t.style, r);
        var n = Object.assign({}, {
                margin: "2px"
            }, e(this.geo_chart_.options_.tooltip.textStyle)),
            l = document.createElement("p");
        if (Object.assign(l.style, n), o = document.createElement("span"), o.style.fontWeight = "bold", l.appendChild(o), t.appendChild(l), this.geo_chart_.data_has_values_) {
            var h = document.createElement("p");
            Object.assign(h.style, n), a = document.createElement("span"), (s = document.createElement("span")).style.fontWeight = "bold", h.appendChild(a), h.appendChild(document.createTextNode(": ")), h.appendChild(s), t.appendChild(h)
        }
        this.div_ = t, this.id_span_ = o, this.label_span_ = a, this.value_span_ = s, this.getPanes().overlayLayer.appendChild(t)
    }, r.prototype.draw = function() {}, r.prototype.drawTooltip = function(t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
            o = t.getId();
        o !== this.id_span_.innerText && (this.id_span_.innerText = o, void 0 !== t.getProperty("data-value") && (this.label_span_.innerText = t.getProperty("data-label"), this.value_span_.innerText = t.getProperty("data-value")));
        var i = 0,
            a = 0,
            s = this.div_.offsetWidth,
            r = this.div_.offsetHeight;
        if (e) {
            var n = this.getProjection().fromLatLngToDivPixel(e);
            i = n.y - 12 - r, a = n.x - 12 - s, i < 0 && (i = n.y + 12), a < 0 && (a = n.x + 12)
        } else {
            var l = new google.maps.LatLngBounds;
            t.getGeometry().forEachLatLng(function(t) {
                l.extend(t)
            });
            var h = this.getProjection().fromLatLngToDivPixel(l.getCenter());
            i = h.y - r / 2, a = h.x - s / 2
        }
        this.div_.style.top = i + "px", this.div_.style.left = a + "px", this.div_.style.visibility = "visible"
    }, r.prototype.undrawTooltip = function() {
        this.div_.style.visibility = "hidden"
    }, t.Tooltip = r;
    var n = function(t) {
        this.geo_chart_ = t, this.div_ = null, this.indicator_span_ = null, this.draw_()
    };
    n.prototype.draw_ = function() {
        var t = document.createElement("div"),
            o = document.createElement("div");
        Object.assign(o.style, {
            marginTop: "8px"
        }, e(this.geo_chart_.options_.legend.textStyle));
        var i = document.createElement("div");
        i.style.padding = "2px 4px", i.style.display = "table-cell", i.innerText = this.geo_chart_.min_, o.appendChild(i);
        var a = document.createElement("div");
        a.style.display = "table-cell", a.style.verticalAlign = "middle", a.style.position = "relative", a.style.padding = "0", a.style.margin = "0";
        var s = document.createElement("div");
        s.style.width = "250px", s.style.height = "13px", s.style.padding = "0", s.style.margin = "0", s.setAttribute("style", s.getAttribute("style") + "; " + this.geo_chart_.color_axis_.getGradientCssStr()), a.appendChild(s);
        var r = document.createElement("span");
        r.style.fontSize = "12px", r.style.top = "-8px", r.style.position = "absolute", r.style.visibility = "hidden", r.innerText = "▼", a.appendChild(r), o.appendChild(a);
        var n = document.createElement("div");
        n.style.padding = "2px 4px", n.style.display = "table-cell", n.innerText = this.geo_chart_.max_, o.appendChild(n), t.appendChild(o), this.div_ = t, this.indicator_span_ = r
    }, n.prototype.getContainer = function() {
        return this.div_
    }, n.prototype.drawIndicator = function(t) {
        var e = 0;
        e = this.geo_chart_.color_axis_.single_value ? .5 : this.geo_chart_.getRelativeValue_(t.getProperty("data-value")), this.indicator_span_.style.left = 250 * e - 6 + "px", this.indicator_span_.style.visibility = "visible"
    }, n.prototype.undrawIndicator = function() {
        this.indicator_span_.style.visibility = "hidden"
    }, t.Legend = n
}(geochart_geojson);