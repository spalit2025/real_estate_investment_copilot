import { User, ArrowRight } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      quote: "I used to spend 2 hours building a model for each deal. Now I get a better analysis in 5 minutes. The tax modeling alone is worth it — I was completely ignoring depreciation recapture before.",
      name: "Marcus T.",
      title: "12-property portfolio, Texas",
    },
    {
      quote: "The sensitivity analysis changed how I think about deals. I passed on a property that looked great on paper but fell apart when I modeled a realistic vacancy rate. Saved me from a bad investment.",
      name: "Rachel K.",
      title: "4 properties, Colorado",
    },
    {
      quote: "Finally, a tool that speaks my language. IRR, equity multiple, REIT comparison — this is how I actually evaluate deals. Not some dumbed-down 'cash on cash' calculator.",
      name: "James L.",
      title: "Former PE analyst, California",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            What Investors Are Saying
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-xl border border-gray-200">
              {/* Quote */}
              <blockquote className="text-gray-700 mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Photo placeholder */}
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Case study callout */}
        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            How one investor analyzed 47 deals in a weekend and found the needle in the haystack
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
