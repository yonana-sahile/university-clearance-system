import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSession } from "../../utils/api";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getSession();

  return null; // The top Header handles primary navigation; Navbar acts as quiet container
}
