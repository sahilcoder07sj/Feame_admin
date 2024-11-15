import z from 'zod';
import * as yup from 'yup'

const email = z.string().trim().min(1, 'Email is required').email('Invalid email');
const password = z.string().min(6, 'Minimum 6 character required');

export const login = z.object({ email, password });

export const forgotPassword = z.object({ email });

export const otpAuthentication = z.object({ otp: z.string().trim().min(4, 'OTP is required').max(4) });

export const resetPassword = z
  .object({ new_password: password, confirm_password: password })
  .refine(({ new_password, confirm_password }) => new_password === confirm_password, {
    message: "Password does't match",
    path: ['confirm_password']
  });

export const event = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.any().optional(),
  google_review_title:z.any().optional(),
  trip_advisor_title:z.any().optional(),
  event_timezone: z.string().optional(),
  event_profile: z.instanceof(File).or(z.string().trim().min(1, 'Photo is required').url('Invalid image url')),
  click_img: z.any().optional(),
  organized_by: z.string().trim().min(1, 'Organized by is required'),
  event_date: z.string().trim().min(1, 'Event date is required'),
  start_time: z.string().trim().min(1, 'Time is required'),
  end_time: z.string().optional(),
  total_seat: z.string().trim().min(1, 'Total seat is required'),
  allowed_user_list: z.array(z.any()).optional(),
  location: z.string().trim().min(1, 'Location is required'),
  city: z.string().trim().min(1, 'City is required'),
  lat: z.string().trim().min(1, 'Latitude is required').or(z.number()),
  lng: z.string().trim().min(1, 'Longitude  is required').or(z.number()),
  event_address: z.string().trim().optional(),
  event_lat: z.string().trim().or(z.number()).optional(),
  event_lng: z.string().trim().or(z.number()).optional(),
  event_type_id: z.string().trim().min(1, 'Event type is required'),
  type: z.string().trim().min(1, 'Event category is required'),
  description: z.string().trim().min(1, 'Description is required'),
  dress_code: z.string().trim().min(1, 'Dress code is required'),
  upcoming_event_city: z.string().optional(),
  rules: z
    .string()
    .trim()
    .min(1, 'Event rules is required')
    .refine(val => val !== '<p><br></p>', { message: 'Please enter event rules' }),
  offer_for_influencers: z
    .string()
    .trim()
    .min(1, 'Proposed offer is required')
    .refine(val => val !== '<p><br></p>', { message: 'Please enter Proposed offer' }),
  google_review: z.string().optional(),
  trip_advisor: z.string().optional(),
  where_tag: z.array(
    z.object({
      id: z.string(),
      text: z.string()
    })
  ),
  keywords: z.any().optional(),
  tags: z.any().optional(),
  is_top: z.any().optional()
});



//  discount

export const discount = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    discount_code: z.string().trim().min(1, 'code is required'),
    discount_amount:z.string().trim().min(1, 'percentage is required'),
    event_profile: z.instanceof(File).or(z.string().trim().min(1, 'Photo is required').url('Invalid image url')),
    click_img: z.any().optional(),
    // event_images: z.any().optional(),
    location: z.string().trim().min(1, 'Location is required'),
    city: z.string().trim().min(1, 'City is required'),
    lat: z.string().trim().min(1, 'Latitude is required').or(z.number()),
    lng: z.string().trim().min(1, 'Longitude  is required').or(z.number()),
    event_address: z.string().trim().min(1, 'Event Address is required'),
    event_lat: z.string().trim().or(z.number()).optional(),
    event_lng: z.string().trim().or(z.number()).optional(),
    subtitle: z.string().trim().min(1, 'subtitle is required'),
});
// export const discount = (isEditMode) => {
//   return z.object({
//     name: z.string().trim().min(1, 'Name is required'),
//     discount_code: z.string().trim().min(1, 'Code is required'),
//     discount_amount: z.string().trim().min(1, 'Percentage is required'),
    
//     // Conditional validation: Only required if not in edit mode
//     event_profile: isEditMode
//       ? z.instanceof(File).or(z.string().trim().min(1, 'Event Profile is required').url('Invalid image url')).optional()
//       : z.instanceof(File).or(z.string().trim().min(1, 'Event Profile is required').url('Invalid image url')),
    
//     click_img: isEditMode ? z.any().optional() : z.any().min(1, 'Event Banner is required'),

//     location: z.string().trim().min(1, 'Location is required'),
//     city: z.string().trim().min(1, 'City is required'),
//     lat: z.string().trim().min(1, 'Latitude is required').or(z.number()),
//     lng: z.string().trim().min(1, 'Longitude is required').or(z.number()),
    
//     event_lat: z.string().trim().or(z.number()).optional(),
//     event_lng: z.string().trim().or(z.number()).optional(),
//     subtitle: z.string().trim().min(1, 'Subtitle is required'),
//   });
// };

export const upcomingEvent = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.any().optional(),
  event_timezone: z.string().optional(),
  event_profile: z.instanceof(File).or(z.string().trim().min(1, 'Photo is required').url('Invalid image url')),
  click_img: z.any().optional(),
  subtitle: z.string().optional(),
  organized_by: z.string().trim().optional(),
  event_date: z.string().trim().optional(),
  start_time: z.string().trim().optional(),
  end_time: z.string().optional(),
  total_seat: z.string().trim().optional(),
  allowed_user_list: z.array(z.any()).optional(),
  location: z.string().trim().optional(),
  city: z.string().trim().optional(),
  lat: z.string().trim().optional().or(z.number()),
  lng: z.string().trim().optional().or(z.number()),
  event_address: z.string().trim().optional(),
  event_lat: z.string().trim().or(z.number()).optional(),
  event_lng: z.string().trim().or(z.number()).optional(),
  event_type_id: z.string().trim().min(1, 'Event type is required'),
  type: z.string().trim().optional(),
  description: z.string().trim().optional(),
  dress_code: z.string().trim().optional(),
  upcoming_event_city: z.string().optional(),
  rules: z
    .string()
    .trim()
    .optional()
    .refine(val => val !== '<p><br></p>', { message: 'Please enter event rules' }),
  offer_for_influencers: z
    .string()
    .trim()
    .optional()
    .refine(val => val !== '<p><br></p>', { message: 'Please enter Proposed offer' }),
  google_review: z.string().trim().optional(),
  trip_advisor: z.string().trim().optional(),
  where_tag: z.array(
    z.object({
      id: z.string(),
      text: z.string()
    })
  ),
  keywords: z.any().optional(),
  tags: z.any().optional(),
  is_top: z.any().optional()

});

export const faq = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required')
})

export const notify = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  message: z.string().trim().min(1, 'Message is required'),
  city_of_residence: z.any().optional()
})

export const eventType = z.object({
  type: z.string().trim().min(1, 'Type is required')
})

export const video = z.object({
  video: z.instanceof(File).or(z.string().trim().min(1, 'Video is required').url('Invalid video url')),
  thumbnail: z.instanceof(File).or(z.string().trim().min(1, 'Thumbnail is required').url('Invalid thumbnail url')),
  name: z.string().trim().min(1, 'Name is required'),
  time: z
    .string()
    .trim()
    .min(1, 'Time is required')
    .regex(/^([01][0-9]|2[0-3]):([0-5][0-9])$/, 'Enter valid time'),
  description: z.string().trim().min(1, 'Description is required')
});

export const scoreboard = z.object({
  month: z.string().trim().min(1, 'Month is required'),
  year: z.number(),
  reel_of_month: z.string().trim().min(1, 'Reel of the month is required'),
  tenk_plus_viral: z.array(z.any()).optional(),
  tenk_minus_viral: z.array(z.any()).optional(),
  video: z.any().optional(),
  thumbnail: z.any().optional()
  //video: z.instanceof(File).or(z.string().trim().min(1, 'Video is required').url('Invalid video url'))
});

export const dataFilterSchema = z.object({
  page: z.number().catch(1),
  limit: z.number().catch(10),
  q: z.string().optional()
});


export const instagramSchema = yup.object().shape({
  instagram_username: yup.string().required('Username is required')
})

export const scoreboardImageSchema = yup.object().shape({
  link: yup.string().required('Link is required'),
  image: yup.mixed().test('Test', 'Image is required', (value) => {
    return value
  })
})

export const dateSchema = z.object({
  event_date: z.string().trim().min(1, 'Event date is required')
})