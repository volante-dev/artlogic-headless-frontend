import "server-only";
import {cache} from "react";
import {getPublicNavigation} from "./client";
export const loadPublicNavigation=cache(getPublicNavigation);
