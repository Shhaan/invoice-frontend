import React, { useEffect, useState } from "react";
import style from "../../Main.module.css";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { axiosInstancemain } from "../../Functions/axios";

function Cartpopup({ today, slot, setslot, setselectedtime, selectedtime }) {
  const [todayslot, settodayslot] = useState({ timeslote: [] });
  const [tomorrowslot, settomorrowslot] = useState({ timeslote: [] });

  const [datetoday, setdatetoday] = useState("");
  const [datetommorow, setdatetommorow] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null); // State to track selected slot

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const { data } = await axiosInstancemain.get("get-timeslot/");
        settodayslot(data.today || { timeslote: [] });
        settomorrowslot(data.tomorrow || { timeslote: [] });

        setdatetoday(data?.today?.date);
        setdatetommorow(data?.tomorrow?.date);
      } catch (e) {
        console.error("Error fetching time slots:", e);
      }
    };

    fetchdata();
  }, []);

  const handleSlotClick = (slot, day, selectedtime) => {
    let date;
    if (day == "today") {
      setselectedtime(2);
      date = datetoday;
    } else if ((day = "tommorow")) {
      setselectedtime(3);
      date = datetommorow;
    }
    setslot((prevState) => ({
      ...prevState,
      deliverytype: day,
      time: slot,
      date: date,
    }));
  };

  return (
    <>
      <button className={style.checkoutcartbutton}>
        {today ? (
          todayslot?.timeslote.length === 0 ? (
            <>
              <h6 style={{ fontSize: "13px" }}>
                No time slot available for today
              </h6>
            </>
          ) : (
            <>
              Today <h6 style={{ fontSize: "13px" }}>{datetoday}</h6>
            </>
          )
        ) : (
          <>
            Tomorrow <h6 style={{ fontSize: "13px" }}>{datetommorow}</h6>
          </>
        )}
      </button>
      {today ? (
        <>
          {todayslot?.timeslote.length > 1 && (
            <>
              <select
                className={style.selectDropdown}
                value={slot?.deliverytype === "today" ? slot?.time : 0}
                onChange={(e) => handleSlotClick(e.target.value, "today")}
              >
                <option value={""}> ----------------------------------</option>
                {todayslot?.timeslote?.map((timeSlot, index) => (
                  <option
                    key={index}
                    className={`${style["time-slot"]} ${
                      selectedSlot === timeSlot ? style.selectedpop : ""
                    }`}
                    value={timeSlot} // Set the value to timeSlot
                  >
                    {timeSlot}
                  </option>
                ))}
              </select>
              {todayslot?.timeslote.length === 0 && (
                <p>No time slots available for today.</p>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <select
            className={style.selectDropdown}
            value={slot?.deliverytype === "tommorow" ? slot?.time : 0}
            onChange={(e) => handleSlotClick(e.target.value, "tommorow")}
          >
            <option value={""}>-------------------------------</option>
            {tomorrowslot?.timeslote?.map((timeSlot, index) => (
              <option
                key={index}
                className={`${style["time-slot"]} ${
                  selectedSlot === timeSlot ? style.selectedpop : ""
                }`}
                value={timeSlot} // Set the value to timeSlot
              >
                {timeSlot}
              </option>
            ))}
          </select>
          {tomorrowslot?.timeslote.length === 0 && (
            <p>No time slots available for tomorrow.</p>
          )}
        </>
      )}
    </>
  );
}

export default Cartpopup;
